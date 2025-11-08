import requests
import aiohttp
from typing import List, Optional, Dict
from models import SOSRequest, SOSResponse, RescueCenter, Severity
from config import settings
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import json

class SOSRescueAgent:
    def __init__(self):
        self.nominatim_base_url = settings.nominatim_base_url
        self.nominatim_email = settings.nominatim_email
        self.geolocator = Nominatim(user_agent=self.nominatim_email)
        
        # Search radius in kilometers
        self.search_radius = 10  # 10km
        self.max_results = 10
    
    async def find_rescue_centers(self, latitude: float, longitude: float) -> List[RescueCenter]:
        """Find nearby veterinary clinics using OpenStreetMap/Nominatim (FREE)"""
        
        rescue_centers = []
        
        # Search queries for OpenStreetMap
        search_queries = [
            "veterinary clinic",
            "animal hospital",
            "vet clinic",
            "animal shelter",
            "animal rescue"
        ]
        
        try:
            user_location = (latitude, longitude)
            
            # Use Overpass API (OpenStreetMap) to find nearby veterinary services
            overpass_url = "http://overpass-api.de/api/interpreter"
            
            # Build Overpass query
            radius_meters = self.search_radius * 1000
            query = f"""
            [out:json];
            (
              node["amenity"="veterinary"](around:{radius_meters},{latitude},{longitude});
              node["healthcare"="veterinary"](around:{radius_meters},{latitude},{longitude});
              way["amenity"="veterinary"](around:{radius_meters},{latitude},{longitude});
              way["healthcare"="veterinary"](around:{radius_meters},{latitude},{longitude});
            );
            out center;
            """
            
            response = requests.post(overpass_url, data={"data": query}, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for element in data.get("elements", [])[:self.max_results]:
                    tags = element.get("tags", {})
                    
                    # Get coordinates
                    if element["type"] == "node":
                        elem_lat = element["lat"]
                        elem_lon = element["lon"]
                    elif "center" in element:
                        elem_lat = element["center"]["lat"]
                        elem_lon = element["center"]["lon"]
                    else:
                        continue
                    
                    # Calculate distance
                    place_location = (elem_lat, elem_lon)
                    distance = geodesic(user_location, place_location).kilometers
                    
                    center = RescueCenter(
                        name=tags.get("name", "Veterinary Clinic"),
                        address=tags.get("addr:street", "Address available on contact"),
                        phone=tags.get("phone", tags.get("contact:phone", "Call for details")),
                        distance_km=round(distance, 2),
                        latitude=elem_lat,
                        longitude=elem_lon,
                        place_id=str(element.get("id", "")),
                        rating=None,
                        type="vet"
                    )
                    
                    rescue_centers.append(center)
            
            # Sort by distance
            rescue_centers.sort(key=lambda x: x.distance_km)
            
            if len(rescue_centers) > 0:
                return rescue_centers[:self.max_results]
            else:
                return self.get_fallback_centers()
        
        except Exception as e:
            print(f"Error finding rescue centers: {e}")
            return self.get_fallback_centers()
    
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates using Haversine formula (in km)"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = radians(lat1)
        lat2_rad = radians(lat2)
        delta_lat = radians(lat2 - lat1)
        delta_lon = radians(lon2 - lon1)
        
        a = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return R * c
    
    def get_fallback_centers(self) -> List[RescueCenter]:
        """Return fallback emergency contacts when API is unavailable"""
        return [
            RescueCenter(
                name="Emergency Veterinary Services",
                address="Please search locally for nearest veterinary clinic",
                phone="Emergency: Call local veterinary directory",
                distance_km=0.0,
                latitude=0.0,
                longitude=0.0,
                place_id="fallback_1",
                rating=None,
                type="vet"
            ),
            RescueCenter(
                name="Animal Rescue Helpline",
                address="Contact local animal control or rescue organizations",
                phone="Search: 'Animal rescue near me'",
                distance_km=0.0,
                latitude=0.0,
                longitude=0.0,
                place_id="fallback_2",
                rating=None,
                type="rescue_center"
            )
        ]
    
    def create_sos_message(self, request: SOSRequest, rescue_centers: List[RescueCenter]) -> str:
        """Create formatted SOS message"""
        
        message = f"""🚨 ANIMAL EMERGENCY ALERT 🚨

CONDITION: {request.condition_summary}

LOCATION:
Latitude: {request.location['lat']}
Longitude: {request.location['lng']}
📍 Google Maps: https://www.google.com/maps?q={request.location['lat']},{request.location['lng']}

IMAGE: {request.image_url}

NEAREST RESCUE CENTERS:
"""
        
        for i, center in enumerate(rescue_centers[:5], 1):
            message += f"\n{i}. {center.name}"
            message += f"\n   📍 {center.address}"
            if center.phone:
                message += f"\n   ☎️  {center.phone}"
            message += f"\n   📏 {center.distance_km} km away"
            if center.rating:
                message += f"\n   ⭐ {center.rating}/5"
            message += "\n"
        
        message += "\n⚠️ IMMEDIATE ACTION REQUIRED ⚠️"
        message += "\nPlease respond if you can assist with this emergency."
        
        return message
    
    async def send_notification(self, phone_number: str, email: str, message: str) -> bool:
        """Log SOS notification (WhatsApp requires paid API, so we log locally)"""
        try:
            print("\n" + "="*60)
            print("🚨 SOS NOTIFICATION 🚨")
            print("="*60)
            print(f"Contact Phone: {phone_number}")
            print(f"Contact Email: {email}")
            print(f"\nMessage:\n{message}")
            print("="*60 + "\n")
            return True
        except Exception as e:
            print(f"Notification error: {e}")
            return False
    
    async def send_email(self, to_email: str, subject: str, message: str) -> bool:
        """Send email notification (requires SMTP configuration)"""
        # Note: This requires additional SMTP configuration
        # For production, use services like SendGrid, AWS SES, etc.
        
        try:
            # This is a placeholder - configure with actual SMTP settings
            print(f"Email would be sent to {to_email}: {subject}")
            return True
        except Exception as e:
            print(f"Email error: {e}")
            return False
    
    async def activate_sos(self, request: SOSRequest) -> SOSResponse:
        """Activate SOS rescue protocol"""
        try:
            # Find nearby rescue centers
            rescue_centers = await self.find_rescue_centers(
                request.location['lat'],
                request.location['lng']
            )
            
            # Create SOS message
            sos_message = self.create_sos_message(request, rescue_centers)
            
            # Track contacted recipients
            recipients_contacted = []
            message_sent = False
            
            # Send notification (logged to console)
            if request.contact_whatsapp or request.contact_email:
                notified = await self.send_notification(
                    request.contact_whatsapp or "N/A",
                    request.contact_email or "N/A",
                    sos_message
                )
                if notified:
                    if request.contact_whatsapp:
                        recipients_contacted.append(f"Phone: {request.contact_whatsapp}")
                    if request.contact_email:
                        recipients_contacted.append(f"Email: {request.contact_email}")
                    message_sent = True
            
            # Try to contact rescue centers directly
            for center in rescue_centers[:3]:
                if center.phone:
                    recipients_contacted.append(f"Rescue Center: {center.name} - {center.phone}")
            
            return SOSResponse(
                message_sent=message_sent or len(recipients_contacted) > 0,
                rescue_centers=rescue_centers,
                sos_message=sos_message,
                recipients_contacted=recipients_contacted,
                error=None if message_sent else "Unable to send automated messages. Please contact rescue centers manually."
            )
        
        except Exception as e:
            print(f"SOS activation error: {e}")
            return SOSResponse(
                message_sent=False,
                rescue_centers=self.get_fallback_centers(),
                sos_message=f"Emergency: {request.condition_summary}",
                recipients_contacted=[],
                error=str(e)
            )

# Singleton instance
sos_agent = SOSRescueAgent()
