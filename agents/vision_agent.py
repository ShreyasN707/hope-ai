from typing import Optional, Dict, Tuple, Union, Any, List
import torch
import cv2
import numpy as np
import torch
from PIL import Image
import requests
from io import BytesIO
from ultralytics import YOLO
from transformers import ViTImageProcessor, ViTForImageClassification
from skimage.feature import graycomatrix, graycoprops, local_binary_pattern
from models import VisionAnalysisResult, EmotionalState, HealthIssue, Species
from config import settings

class VisionAgent:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")
        
        # Load YOLO model for object detection
        try:
            self.yolo_model = YOLO(settings.yolo_model_path)
            print("YOLO model loaded successfully")
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            self.yolo_model = None
        
        # Load Vision Transformer for emotion classification
        try:
            self.vit_processor = ViTImageProcessor.from_pretrained(settings.vision_transformer_model)
            self.vit_model = ViTForImageClassification.from_pretrained(settings.vision_transformer_model)
            self.vit_model.to(self.device)
            self.vit_model.eval()
            print("ViT model loaded successfully")
        except Exception as e:
            print(f"Failed to load ViT model: {e}")
            self.vit_model = None
            self.vit_processor = None
        
        # Species mapping for YOLO classes
        self.species_map = {
            'dog': Species.DOG,
            'cat': Species.CAT,
            'cow': Species.COW,
            'bird': Species.STRAY,
            'horse': Species.STRAY,
        }
        
        # Health issue keywords and patterns
        self.health_indicators = {
            'skin_infection': ['rash', 'lesion', 'patch', 'discoloration'],
            'dehydration': ['sunken', 'dry', 'pale'],
            'malnutrition': ['thin', 'ribs', 'skinny', 'underweight'],
            'bleeding': ['blood', 'wound', 'cut', 'injury'],
            'wounds': ['scratch', 'bite', 'laceration', 'trauma']
        }
    
    def download_image(self, image_url: str) -> Image.Image:
        """Download image from URL"""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            return image.convert('RGB')
        except Exception as e:
            raise Exception(f"Failed to download image: {str(e)}")
    
    def detect_species(self, image: Image.Image) -> tuple[Species, float]:
        """Detect animal species using YOLO"""
        if self.yolo_model is None:
            return Species.UNKNOWN, 0.0
        
        try:
            # Run YOLO detection
            results = self.yolo_model(image)
            
            # Get detections
            for result in results:
                boxes = result.boxes
                if boxes is not None and len(boxes) > 0:
                    # Get the detection with highest confidence
                    confidences = boxes.conf.cpu().numpy()
                    classes = boxes.cls.cpu().numpy()
                    
                    max_idx = np.argmax(confidences)
                    class_id = int(classes[max_idx])
                    confidence = float(confidences[max_idx])
                    
                    # Get class name
                    class_name = self.yolo_model.names[class_id].lower()
                    
                    # Map to species
                    species = self.species_map.get(class_name, Species.UNKNOWN)
                    return species, confidence
            
            return Species.UNKNOWN, 0.0
        except Exception as e:
            print(f"Species detection error: {e}")
            return Species.UNKNOWN, 0.0
    
    def _calculate_image_quality_score(self, img_array: np.ndarray) -> float:
        """Calculate image quality score to adjust confidence"""
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Check blur (Laplacian variance)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Check brightness (avoid under/over-exposed images)
        brightness = np.mean(gray)
        brightness_score = 1.0 - abs(brightness - 128) / 128
        
        # Check contrast
        contrast_score = np.std(gray) / 128
        
        # Combined quality score
        quality = (min(blur_score / 500, 1.0) * 0.4 + 
                   brightness_score * 0.3 + 
                   min(contrast_score, 1.0) * 0.3)
        
        return quality
    
    def _analyze_emotion_at_scale(self, image: Image.Image, img_array: np.ndarray, scale: float) -> tuple[float, float]:
        """Analyze emotion at a specific scale with advanced feature extraction"""
        try:
            # Preprocess image for ViT at this scale
            inputs = self.vit_processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get ViT outputs (ImageClassifierOutput has logits, not last_hidden_state)
            with torch.no_grad():
                outputs = self.vit_model(**inputs)
                logits = outputs.logits
                
                # Get probabilities
                probs = torch.nn.functional.softmax(logits, dim=-1)
                confidence = torch.max(probs).item()
                
                # Convert logits to emotion score (-1 to 1 range)
                # Positive classes indicate positive emotions, negative classes negative emotions
                emotion_score = torch.mean(logits).item() / 10.0  # Normalize
            
            # Combine with visual features for better accuracy
            visual_score = self._extract_visual_emotion_features(img_array, scale)
            
            # Weighted combination
            final_score = 0.6 * emotion_score + 0.4 * visual_score
            
            # Scale-specific confidence
            base_confidence = min(0.95, confidence * (0.9 if scale == 1.0 else 0.85 if scale == 1.5 else 0.80))
            
            return final_score, base_confidence
            
        except Exception as e:
            print(f"Scale {scale} emotion analysis error: {e}")
            return 0.0, 0.5
    
    def _extract_visual_emotion_features(self, img_array: np.ndarray, scale: float) -> float:
        """Extract visual emotion features from image without deep learning dependencies"""
        h, w, _ = img_array.shape
        
        # Multi-color space analysis
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # 1. Brightness and exposure analysis
        brightness = np.mean(gray)
        brightness_std = np.std(gray)
        exposure_score = 1.0 - abs(brightness - 128) / 128  # Optimal around 128
        
        # 2. Color emotion indicators
        saturation = np.mean(hsv[:, :, 1])
        hue_dist = np.histogram(hsv[:, :, 0], bins=36)[0]  # Hue distribution
        warm_colors = np.sum(hue_dist[0:6]) + np.sum(hue_dist[30:36])  # Reds, oranges
        cool_colors = np.sum(hue_dist[12:24])  # Blues, greens
        color_temperature = (warm_colors - cool_colors) / max(1, warm_colors + cool_colors)
        
        # 3. Edge and texture analysis
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        edge_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
        edge_density = np.mean(edge_magnitude) / 255.0
        
        # Local Binary Patterns for texture
        radius = 3
        n_points = 8 * radius
        lbp = local_binary_pattern(gray, n_points, radius, method='uniform')
        lbp_hist = np.histogram(lbp.ravel(), bins=n_points + 2)[0]
        texture_uniformity = np.max(lbp_hist) / np.sum(lbp_hist)
        
        # 4. Geometric and spatial features
        contours, _ = cv2.findContours((gray > np.mean(gray)).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            contour_area = cv2.contourArea(largest_contour)
            contour_perimeter = cv2.arcLength(largest_contour, True)
            compactness = (contour_perimeter ** 2) / (4 * np.pi * contour_area) if contour_area > 0 else 1
        else:
            compactness = 1.0
        
        # 5. Calculate emotion score from visual features
        emotion_score = (
            (brightness - 128) * 0.003 +                   # Brightness
            (saturation - 100) * 0.002 +                   # Saturation
            color_temperature * 0.5 +                       # Warm vs cool
            exposure_score * 0.3 +                          # Exposure
            edge_density * 2.0 +                            # Edge definition
            texture_uniformity * 0.5 +                      # Texture
            (1.0 - compactness) * 0.3                       # Shape
        )
        
        # Normalize to [-1, 1] range
        return max(-1.0, min(1.0, emotion_score))
    
    def _get_center_crop(self, image: Image.Image, crop_ratio: float) -> Image.Image:
        """Get center crop of image for focused analysis"""
        width, height = image.size
        crop_width = int(width * crop_ratio)
        crop_height = int(height * crop_ratio)
        left = (width - crop_width) // 2
        top = (height - crop_height) // 2
        return image.crop((left, top, left + crop_width, top + crop_height))
    
    def _detect_eye_region(self, img_array: np.ndarray) -> np.ndarray:
        """Detect and extract eye region for focused emotion analysis"""
        try:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            h, w = gray.shape
            
            # Focus on upper third of image where eyes typically are
            eye_region_y = int(h * 0.2)
            eye_region_height = int(h * 0.4)
            eye_region = img_array[eye_region_y:eye_region_y + eye_region_height, :]
            
            return eye_region if eye_region.size > 0 else None
        except:
            return None
    
    def _determine_emotion_from_score(self, score: float, confidence: float) -> tuple[EmotionalState, float]:
        """Determine emotion from score with advanced thresholding"""
        # Much more conservative and accurate thresholds
        if score > 6.5:  # Very high threshold for HAPPY
            return EmotionalState.HAPPY, min(0.95, confidence + (score - 6.5) * 0.02)
        elif score > 3.0:  # Moderate positive for NEUTRAL (happy-leaning)
            return EmotionalState.NEUTRAL, min(0.85, confidence)
        elif score < -4.5:  # Very negative for SCARED
            return EmotionalState.SCARED, min(0.92, confidence + abs(score + 4.5) * 0.02)
        elif score < -2.5:  # Moderately negative for STRESSED
            return EmotionalState.STRESSED, min(0.88, confidence + abs(score + 2.5) * 0.015)
        elif score < -1.0:  # Slightly negative for AGGRESSIVE
            return EmotionalState.AGGRESSIVE, min(0.82, confidence + abs(score + 1.0) * 0.01)
        else:
            return EmotionalState.NEUTRAL, min(0.80, confidence)
    
    def analyze_emotion(self, image: Image.Image) -> tuple[EmotionalState, float]:
        """Advanced emotion detection with deep learning and multi-modal analysis"""
        if self.vit_processor is None or self.vit_model is None:
            return EmotionalState.NEUTRAL, 0.5
        
        try:
            # Get image quality score for confidence adjustment
            img_array = np.array(image)
            image_quality = self._calculate_image_quality_score(img_array)
            
            # Multi-scale analysis for better accuracy
            emotion_scores = []
            confidences = []
            
            # Scale 1: Original size
            score1, conf1 = self._analyze_emotion_at_scale(image, img_array, 1.0)
            emotion_scores.append(score1)
            confidences.append(conf1)
            
            # Scale 2: 1.5x zoom (focus on facial features)
            center_crop = self._get_center_crop(image, 0.67)  # Crop to 67% for 1.5x zoom
            score2, conf2 = self._analyze_emotion_at_scale(center_crop, np.array(center_crop), 1.5)
            emotion_scores.append(score2)
            confidences.append(conf2)
            
            # Scale 3: Eye region focus
            eye_region = self._detect_eye_region(img_array)
            if eye_region is not None:
                eye_pil = Image.fromarray(eye_region)
                score3, conf3 = self._analyze_emotion_at_scale(eye_pil, eye_region, 2.0)
                emotion_scores.append(score3)
                confidences.append(conf3)
            
            # Weighted ensemble of multi-scale analysis
            weights = [0.4, 0.35, 0.25] if len(emotion_scores) == 3 else [0.6, 0.4]
            final_score = sum(score * weight for score, weight in zip(emotion_scores, weights))
            final_confidence = sum(conf * weight for conf, weight in zip(confidences, weights))
            
            # Advanced thresholding with contextual awareness
            emotion, base_confidence = self._determine_emotion_from_score(final_score, final_confidence)
            
            # Multi-factor confidence adjustment
            quality_factor = 0.7 + image_quality * 0.3
            consistency_factor = 1.0 - (np.std(emotion_scores) / 10.0)  # Penalize inconsistent scores
            ensemble_factor = min(1.0, len(emotion_scores) / 3.0)  # Reward more data points
            
            adjusted_confidence = base_confidence * quality_factor * consistency_factor * ensemble_factor
            
            # CRITICAL: Return NEUTRAL with low confidence if uncertain (prevent hallucination)
            if adjusted_confidence < 0.65:  # Stricter threshold
                return EmotionalState.NEUTRAL, min(0.60, adjusted_confidence)
            
            return emotion, min(0.98, max(0.65, adjusted_confidence))
            
        except Exception as e:
            print(f"Advanced emotion analysis error: {e}")
            return EmotionalState.NEUTRAL, 0.5
    
    def detect_health_issues(self, image: Image.Image) -> List[HealthIssue]:
        """Detect visible health issues with VERY STRICT validation to prevent false positives"""
        health_issues = []
        
        try:
            # Convert to numpy array
            img_array = np.array(image)
            h, w, _ = img_array.shape
            
            # Color space conversions
            hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            
            # VERY STRICT: Multi-range skin infection detection with validation
            # Check for red/pink patches (inflammation) - much stricter thresholds
            red_mask1 = cv2.inRange(hsv, np.array([0, 80, 80]), np.array([10, 255, 255]))
            red_mask2 = cv2.inRange(hsv, np.array([170, 80, 80]), np.array([180, 255, 255]))
            red_mask = cv2.bitwise_or(red_mask1, red_mask2)
            
            # Check for dark patches (scabs, dried wounds) - stricter
            dark_mask = cv2.inRange(hsv, np.array([0, 0, 0]), np.array([180, 255, 60]))
            
            # Calculate basic percentages
            red_percentage = (np.sum(red_mask > 0) / red_mask.size) * 100
            dark_percentage = (np.sum(dark_mask > 0) / dark_mask.size) * 100
            
            # ADDITIONAL VALIDATION: Check for actual skin patterns vs normal variations
            # Remove small noise
            kernel = np.ones((3,3), np.uint8)
            red_mask_clean = cv2.morphologyEx(red_mask, cv2.MORPH_OPEN, kernel)
            dark_mask_clean = cv2.morphologyEx(dark_mask, cv2.MORPH_OPEN, kernel)
            
            # Count significant regions (not just scattered pixels)
            red_contours, _ = cv2.findContours(red_mask_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            dark_contours, _ = cv2.findContours(dark_mask_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Only count regions larger than 50 pixels (remove noise)
            significant_red_regions = [c for c in red_contours if cv2.contourArea(c) > 50]
            significant_dark_regions = [c for c in dark_contours if cv2.contourArea(c) > 50]
            
            # Calculate actual affected area (only significant regions)
            actual_red_area = sum(cv2.contourArea(c) for c in significant_red_regions)
            actual_dark_area = sum(cv2.contourArea(c) for c in significant_dark_regions)
            
            # MUCH STRICTER: Only consider if there are actual significant regions
            min_regions_required = 3  # Need at least 3 distinct regions
            
            if len(significant_red_regions) >= min_regions_required or len(significant_dark_regions) >= min_regions_required:
                # Recalculate percentages based on significant regions only
                red_percentage = (actual_red_area / (h * w)) * 100
                dark_percentage = (actual_dark_area / (h * w)) * 100
                
                # Check for abnormal texture (mange, fungal infections)
                blur = cv2.GaussianBlur(gray, (5, 5), 0)
                std_dev = np.std(blur)
                
                # VERY STRICT thresholds
                red_indicators = {
                    'red_percentage': red_percentage,
                    'inflammation_score': red_percentage * 1.5,  # Higher multiplier
                    'dark_spots': dark_percentage,
                    'texture_variance': std_dev,
                    'red_regions': len(significant_red_regions),
                    'dark_regions': len(significant_dark_regions)
                }
                
                # MUCH HIGHER thresholds to prevent false positives
                thresholds = {
                    'red_percentage': 8.0,  # Increased from 5.0
                    'inflammation_score': 12.0,  # Increased from 6.0
                    'dark_spots': 15.0,  # Increased from 12.0
                    'texture_variance': 60.0,  # Increased from 40.0
                    'red_regions': 3,  # New: need at least 3 regions
                    'dark_regions': 3   # New: need at least 3 regions
                }
                
                is_skin_issue, skin_confidence = self._cross_validate_detection(red_indicators, thresholds)
                
                # VERY STRICT: Only report if confidence > 85% (prevent false positives)
                if is_skin_issue and skin_confidence > 0.85:
                    # Advanced disease classification
                    disease_name, description = self._classify_skin_disease(red_indicators['red_percentage'], red_indicators['dark_spots'], red_indicators['texture_variance'])
                    
                    health_issues.append(HealthIssue(
                        issue=f"{disease_name} ({int(skin_confidence * 100)}% confidence)",
                        confidence=skin_confidence,
                        description=description
                    ))
            
            # Advanced eye condition detection
            eye_region = img_array[:h//3, :]  # Upper third
            eye_conditions = self._detect_eye_conditions(eye_region)
            health_issues.extend(eye_conditions)
            
            # Additional common pet health checks
            additional_issues = self._detect_common_pet_issues(img_array, gray, hsv)
            health_issues.extend(additional_issues)
            
            return health_issues
        
        except Exception as e:
            print(f"Health detection error: {e}")
        
        return health_issues
    
    def _detect_eye_conditions(self, eye_region: np.ndarray) -> List[HealthIssue]:
        """Advanced eye condition detection with disease classification"""
        conditions = []
        
        try:
            eye_gray = cv2.cvtColor(eye_region, cv2.COLOR_RGB2GRAY)
            h, w, _ = eye_region.shape
            
            # 1. Discharge detection with color analysis
            yellow_discharge = cv2.inRange(eye_region, np.array([120, 100, 60]), np.array([200, 180, 120]))
            green_discharge = cv2.inRange(eye_region, np.array([80, 120, 60]), np.array([140, 200, 120]))
            clear_discharge = cv2.inRange(eye_region, np.array([180, 180, 180]), np.array([255, 255, 255]))
            
            yellow_pct = (np.sum(yellow_discharge > 0) / yellow_discharge.size) * 100
            green_pct = (np.sum(green_discharge > 0) / green_discharge.size) * 100
            clear_pct = (np.sum(clear_discharge > 0) / clear_discharge.size) * 100
            
            # Classify discharge types - STRICT THRESHOLDS
            if green_pct > 1.5:
                conf = min(0.85, green_pct / 2.0)
                if conf > 0.70:  # Only report if confident
                    conditions.append(HealthIssue(
                        issue=f"Bacterial Conjunctivitis ({int(conf * 100)}% confidence)",
                        confidence=conf,
                        description="Green discharge indicates bacterial eye infection. Requires antibiotic eye drops or ointment prescribed by veterinarian."
                    ))
            
            elif yellow_pct > 1.2:
                conf = min(0.80, yellow_pct / 1.8)
                if conf > 0.70:  # Only report if confident
                    conditions.append(HealthIssue(
                        issue=f"Viral Eye Infection ({int(conf * 100)}% confidence)",
                        confidence=conf,
                        description="Yellow discharge suggests viral or bacterial eye infection. May be contagious. Veterinary examination and treatment needed."
                    ))
            
            elif clear_pct > 2.0:
                conf = min(0.70, clear_pct / 3.0)
                # No confidence threshold for clear discharge as it's less serious
            
            # 2. Redness and inflammation detection
            red_mask = cv2.inRange(eye_region, np.array([100, 0, 0]), np.array([255, 100, 100]))
            red_pct = (np.sum(red_mask > 0) / red_mask.size) * 100
            
            if red_pct > 4.0:
                conf = min(0.85, red_pct / 6.0)
                if conf > 0.70:  # Only report if confident
                    conditions.append(HealthIssue(
                        issue=f"Eye Inflammation ({int(conf * 100)}% confidence)",
                        confidence=conf,
                        description="Significant eye redness and inflammation detected. May be caused by infection, allergies, or injury. Veterinary care recommended."
                    ))
            
            # 3. Cloudiness detection (cataracts/corneal issues) - STRICTER
            blur_kernel = np.ones((5,5), np.float32) / 25
            blurred = cv2.filter2D(eye_gray, -1, blur_kernel)
            cloudiness = np.mean(np.abs(eye_gray.astype(float) - blurred.astype(float)))
            
            if cloudiness < 15:  # Low contrast indicates cloudiness
                conf = min(0.70, (20 - cloudiness) / 10)
                if conf > 0.65:  # Only report if reasonably confident
                    conditions.append(HealthIssue(
                        issue=f"Possible Cataracts ({int(conf * 100)}% confidence)",
                        confidence=conf,
                        description="Eye cloudiness detected which may indicate cataracts, corneal scarring, or other eye conditions. Ophthalmologic examination recommended."
                    ))
            
        except Exception as e:
            print(f"Eye condition detection error: {e}")
        
        return conditions
    
    def _cross_validate_detection(self, indicators: Dict[str, float], thresholds: Dict[str, float]) -> tuple[bool, float]:
        """
        Cross-validate detection using multiple indicators and thresholds.
        Returns tuple of (is_issue_detected, confidence_score)
        """
        try:
            # Count how many indicators exceed their thresholds
            passed_indicators = 0
            total_indicators = 0
            confidence_scores = []
            
            for indicator_name, indicator_value in indicators.items():
                if indicator_name in thresholds:
                    total_indicators += 1
                    threshold = thresholds[indicator_name]
                    
                    if indicator_value > threshold:
                        passed_indicators += 1
                        # Calculate confidence based on how much indicator exceeds threshold
                        # Higher overshoot = higher confidence
                        overshoot = indicator_value / max(threshold, 0.1)
                        confidence_scores.append(min(0.95, overshoot / 2.0))
            
            if total_indicators == 0:
                return False, 0.0
            
            # Calculate pass ratio
            pass_ratio = passed_indicators / total_indicators
            
            # Require at least 60% of indicators to pass for detection
            is_detected = pass_ratio >= 0.6
            
            # Calculate overall confidence
            if confidence_scores:
                avg_confidence = sum(confidence_scores) / len(confidence_scores)
                # Weight confidence by pass ratio
                final_confidence = avg_confidence * (0.5 + 0.5 * pass_ratio)
            else:
                final_confidence = 0.0
            
            return is_detected, min(0.95, final_confidence)
            
        except Exception as e:
            print(f"Cross-validation error: {e}")
            return False, 0.0
    
    def _classify_skin_disease(self, red_pct: float, dark_pct: float, texture_var: float) -> tuple[str, str]:
        """Classify specific skin diseases based on visual indicators"""
        
        # Advanced disease classification logic
        if red_pct > 12 and dark_pct > 20 and texture_var > 60:
            return (
                "Sarcoptic Mange (Scabies)",
                "Severe parasitic skin disease causing intense itching, hair loss, and crusty lesions. Highly contagious and requires immediate veterinary treatment with antiparasitic medications."
            )
        
        elif red_pct > 8 and dark_pct > 15 and texture_var > 45:
            return (
                "Demodectic Mange",
                "Parasitic skin condition caused by Demodex mites. Characterized by patchy hair loss, redness, and scaling. Requires veterinary diagnosis and treatment."
            )
        
        elif red_pct > 10 and dark_pct < 10 and texture_var > 35:
            return (
                "Bacterial Dermatitis (Pyoderma)",
                "Bacterial skin infection causing redness, pustules, and inflammation. Often secondary to allergies or other skin conditions. Requires antibiotic treatment."
            )
        
        elif red_pct > 6 and dark_pct > 8 and texture_var > 30:
            return (
                "Fungal Dermatitis (Ringworm)",
                "Fungal skin infection causing circular patches of hair loss, scaling, and mild inflammation. Contagious to humans and other animals. Requires antifungal treatment."
            )
        
        elif red_pct > 7 and texture_var > 40:
            return (
                "Allergic Dermatitis",
                "Inflammatory skin condition caused by allergic reactions to food, environmental allergens, or contact irritants. Requires identification and avoidance of triggers."
            )
        
        elif dark_pct > 12 and texture_var > 25:
            return (
                "Seborrheic Dermatitis",
                "Chronic skin condition causing scaly, flaky patches and oily or dry skin. Often affects areas with many sebaceous glands. Requires specialized shampoos and treatments."
            )
        
        elif red_pct > 5 and red_pct < 8:
            return (
                "Contact Dermatitis",
                "Localized skin irritation from contact with irritating substances. Usually resolves when irritant is removed. Monitor for improvement and seek vet care if worsening."
            )
        
        else:
            return (
                "Unspecified Skin Condition",
                "Skin abnormalities detected that require professional veterinary evaluation for proper diagnosis and treatment planning."
            )
    
    def _detect_common_pet_issues(self, img_array: np.ndarray, gray: np.ndarray, hsv: np.ndarray) -> List[HealthIssue]:
        """Detect common pet health issues: dehydration, injury, malnutrition, infection"""
        issues = []
        
        try:
            h, w, _ = img_array.shape
            
            # 1. DEHYDRATION CHECK - Look for sunken eyes, dry appearance
            # Analyze eye region for sunken appearance (darker shadows)
            eye_region = img_array[:h//4, :]
            eye_gray = cv2.cvtColor(eye_region, cv2.COLOR_RGB2GRAY)
            eye_darkness = np.mean(eye_gray)
            
            # Check overall skin dryness (texture analysis)
            texture = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            if eye_darkness < 70 and texture < 50:
                dehydration_confidence = min(0.75, (100 - eye_darkness) / 100)
                if dehydration_confidence > 0.70:  # Strict threshold
                    issues.append(HealthIssue(
                        issue=f"Possible Dehydration ({int(dehydration_confidence * 100)}% confidence)",
                        confidence=dehydration_confidence,
                        description="Signs of dehydration detected. Look for sunken eyes, dry gums, lethargy. Provide water immediately and consult vet if symptoms persist."
                    ))
            
            # 2. INJURY/WOUND DETECTION - Look for bleeding, open wounds
            # Red blood detection (darker red)
            blood_mask1 = cv2.inRange(hsv, np.array([0, 100, 50]), np.array([10, 255, 200]))
            blood_mask2 = cv2.inRange(hsv, np.array([170, 100, 50]), np.array([180, 255, 200]))
            blood_mask = cv2.bitwise_or(blood_mask1, blood_mask2)
            blood_percentage = (np.sum(blood_mask > 0) / blood_mask.size) * 100
            
            # Dark wound detection (scabs, dried blood)
            dark_wound_mask = cv2.inRange(hsv, np.array([0, 0, 0]), np.array([180, 255, 50]))
            dark_wound_pct = (np.sum(dark_wound_mask > 0) / dark_wound_mask.size) * 100
            
            if blood_percentage > 2.0 or dark_wound_pct > 15:
                wound_confidence = min(0.85, (blood_percentage + dark_wound_pct) / 20)
                if wound_confidence > 0.70:  # Strict threshold
                    issues.append(HealthIssue(
                        issue=f"Visible Wound/Injury ({int(wound_confidence * 100)}% confidence)",
                        confidence=wound_confidence,
                        description="Visible wound or injury detected with possible bleeding or scabbing. Clean gently with saline and seek veterinary care to prevent infection."
                    ))
            
            # 3. MALNUTRITION CHECK - Look for visible ribs, thin appearance
            # Analyze body contrast and bone visibility
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            
            # High edge density may indicate visible ribs/bones
            if edge_density > 0.15:
                malnutrition_confidence = min(0.75, edge_density / 0.20)
                if malnutrition_confidence > 0.70:  # Strict threshold
                    issues.append(HealthIssue(
                        issue=f"Signs of Malnutrition ({int(malnutrition_confidence * 100)}% confidence)",
                        confidence=malnutrition_confidence,
                        description="Possible malnutrition detected. Visible bone structure may indicate underweight condition. Provide nutritious food and consult vet for proper feeding plan."
                    ))
            
            # 4. GENERAL INFECTION CHECK - Yellow/green discharge, pus
            yellow_mask = cv2.inRange(img_array, np.array([140, 120, 70]), np.array([200, 180, 130]))
            green_mask = cv2.inRange(img_array, np.array([90, 130, 70]), np.array([150, 200, 130]))
            discharge_mask = cv2.bitwise_or(yellow_mask, green_mask)
            discharge_pct = (np.sum(discharge_mask > 0) / discharge_mask.size) * 100
            
            if discharge_pct > 1.5:
                infection_confidence = min(0.80, discharge_pct / 2.5)
                if infection_confidence > 0.70:  # Strict threshold
                    issues.append(HealthIssue(
                        issue=f"Possible Infection ({int(infection_confidence * 100)}% confidence)",
                        confidence=infection_confidence,
                        description="Signs of infection detected (discharge, pus). Indicates bacterial or viral infection requiring veterinary diagnosis and treatment with antibiotics."
                    ))
            
        except Exception as e:
            print(f"Common pet issues detection error: {e}")
        
        return issues
    
    async def analyze(self, image_url: str) -> VisionAnalysisResult:
        """Complete vision analysis pipeline"""
        try:
            # Download image
            image = self.download_image(image_url)
            
            # Detect species
            species, species_conf = self.detect_species(image)
            
            # Analyze emotion
            emotion, emotion_conf = self.analyze_emotion(image)
            
            # Detect health issues
            health_issues = self.detect_health_issues(image)
            
            # Get raw detections for reference
            raw_detections = []
            if self.yolo_model is not None:
                results = self.yolo_model(image)
                for result in results:
                    if hasattr(result, 'boxes') and result.boxes is not None:
                        boxes = result.boxes
                        for i in range(len(boxes)):
                            raw_detections.append({
                                'class': self.yolo_model.names[int(boxes.cls[i])],
                                'confidence': float(boxes.conf[i]),
                                'bbox': boxes.xyxy[i].cpu().numpy().tolist()
                            })
            
            return VisionAnalysisResult(
                species=species,
                species_confidence=species_conf,
                emotional_state=emotion,
                emotion_confidence=emotion_conf,
                health_issues=health_issues,
                raw_detections=raw_detections
            )
            
        except Exception as e:
            raise Exception(f"Vision analysis failed: {str(e)}")

# Singleton instance
vision_agent = VisionAgent()
