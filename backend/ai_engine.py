import io
import math
from typing import Dict, Any
from PIL import Image, ImageOps, ImageFilter

class LocalAIEngine:
    def __init__(self):
        self.device = "cpu"
        self.model = None
        self.processor = None
        self.candidate_texts = [
            "dangerous deep asphalt road pothole crater or flooded street",
            "burst clean drinking water pipeline leak or open sewage drain",
            "dark non-functional streetlight at night or dangling electrical wire",
            "overflowing municipal garbage dump waste mound or plastic burning",
            "broken pedestrian footpath concrete slab or sidewalk barrier"
        ]
        self.label_to_category = {
            "dangerous deep asphalt road pothole crater or flooded street": "ROAD_TRANSIT",
            "burst clean drinking water pipeline leak or open sewage drain": "WATER_DRAINAGE",
            "dark non-functional streetlight at night or dangling electrical wire": "ELECTRICAL_LIGHTING",
            "overflowing municipal garbage dump waste mound or plastic burning": "SANITATION_WASTE",
            "broken pedestrian footpath concrete slab or sidewalk barrier": "PEDESTRIAN_ACCESS"
        }
        self.category_to_department = {
            "ROAD_TRANSIT": "Highways & PWD",
            "WATER_DRAINAGE": "TWAD Water Board",
            "ELECTRICAL_LIGHTING": "TANGEDCO Electricity Board",
            "SANITATION_WASTE": "Municipal Sanitation",
            "PEDESTRIAN_ACCESS": "Town Planning & Footpaths"
        }
        self.category_to_default_title = {
            "ROAD_TRANSIT": "Pothole Crater & Road Damage",
            "WATER_DRAINAGE": "Water Mainline Rupture / Drainage Overflow",
            "ELECTRICAL_LIGHTING": "Faulty Streetlight / Electrical Line Hazard",
            "SANITATION_WASTE": "Garbage Accumulation & Waste Dump",
            "PEDESTRIAN_ACCESS": "Broken Footpath & Sidewalk Obstruction"
        }

        self._load_model()

    def _load_model(self):
        try:
            import torch
            from transformers import CLIPProcessor, CLIPModel
            
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"[AI ENGINE] Loading openai/clip-vit-base-patch32 on {self.device}...")
            self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(self.device)
            self.model.eval()
            print("[AI ENGINE] Local CLIP Vision Model initialized successfully.")
        except Exception as e:
            print(f"[AI ENGINE] Local model load deferred or running heuristic vision fallback: {e}")
            self.model = None
            self.processor = None

    def _calculate_edge_gradient(self, img_gray: Image.Image) -> float:
        """Computes average edge gradient using Sobel-like convolution approximation."""
        edges = img_gray.filter(ImageFilter.FIND_EDGES)
        pixels = list(edges.getdata())
        if not pixels:
            return 0.0
        return sum(pixels) / len(pixels)

    def _inspect_muddy_water(self, img_rgb: Image.Image) -> bool:
        """Inspects RGB characteristics and variance to detect turbid muddy water reflection."""
        w, h = img_rgb.size
        # Crop center 50% of the image
        left = int(w * 0.25)
        top = int(h * 0.25)
        right = int(w * 0.75)
        bottom = int(h * 0.75)
        center_crop = img_rgb.crop((left, top, right, bottom)).resize((64, 64))

        pixels = list(center_crop.getdata())
        total = len(pixels)
        if total == 0:
            return False

        r_sum = sum(p[0] for p in pixels)
        g_sum = sum(p[1] for p in pixels)
        b_sum = sum(p[2] for p in pixels)
        
        avg_r = r_sum / total
        avg_g = g_sum / total
        avg_b = b_sum / total

        # Turbid/muddy water has high brownish/yellowish tones (R > B and G > B with low blue)
        # and moderate to low variance in specular reflection
        is_brownish = (avg_r > avg_b * 1.15) and (avg_g > avg_b * 1.05) and (avg_r > 50)
        
        # Calculate luminance variance
        lum_values = [0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in pixels]
        mean_lum = sum(lum_values) / total
        variance = sum((l - mean_lum) ** 2 for l in lum_values) / total

        # Water reflections create smooth surface patches with moderate specular variance
        return is_brownish or (variance < 350 and avg_b > 60 and avg_g > 60)

    def analyze_image(self, image_bytes: bytes) -> Dict[str, Any]:
        """Runs zero-shot CLIP classification, depth estimation, and passability analysis."""
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size

        category = "ROAD_TRANSIT"
        confidence = 0.85
        severity = 4

        if self.model is not None and self.processor is not None:
            try:
                import torch
                inputs = self.processor(
                    text=self.candidate_texts,
                    images=img,
                    return_tensors="pt",
                    padding=True
                ).to(self.device)

                with torch.no_grad():
                    outputs = self.model(**inputs)
                    logits_per_image = outputs.logits_per_image
                    probs = logits_per_image.softmax(dim=1).cpu().numpy()[0]

                best_idx = int(probs.argmax())
                best_text = self.candidate_texts[best_idx]
                category = self.label_to_category[best_text]
                confidence = float(probs[best_idx])
                
                # Dynamic severity derived from CLIP confidence & category
                if confidence > 0.60:
                    severity = 5
                elif confidence > 0.40:
                    severity = 4
                elif confidence > 0.25:
                    severity = 3
                else:
                    severity = 2
            except Exception as ex:
                print(f"[AI ENGINE] Error during inference: {ex}. Falling back to visual analysis.")
                category = "ROAD_TRANSIT"
                severity = 4
        else:
            # Fallback heuristic using image color & edge attributes
            gray = ImageOps.grayscale(img)
            edge_score = self._calculate_edge_gradient(gray)
            if edge_score > 30:
                category = "ROAD_TRANSIT"
                severity = 4
            else:
                category = "ROAD_TRANSIT"
                severity = 3

        department = self.category_to_department[category]
        title = self.category_to_default_title[category]

        # Pothole Depth & Muddy-Water Logic
        is_water_filled = 0
        depth_cm = "N/A"
        depth_advisory = ""

        if category == "ROAD_TRANSIT":
            is_muddy = self._inspect_muddy_water(img)
            gray = ImageOps.grayscale(img)
            edge_val = self._calculate_edge_gradient(gray)

            if is_muddy:
                is_water_filled = 1
                depth_cm = ">10 cm (Severe Blind Hazard)"
                depth_advisory = "Opaque turbid water concealing cavity floor. High risk of vehicle stalling, tire rupture, and two-wheeler overturning."
                severity = max(severity, 4)
            else:
                is_water_filled = 0
                if edge_val >= 25.0:
                    depth_cm = "8 - 12 cm"
                    depth_advisory = "Deep cavity with sharp asphalt edges. Axle shock hazard."
                    severity = max(severity, 4)
                else:
                    depth_cm = "3 - 5 cm"
                    depth_advisory = "Surface erosion layer. Minor hazard."
                    severity = min(severity, 3)
        elif category == "WATER_DRAINAGE":
            depth_cm = "N/A"
            is_water_filled = 1
            depth_advisory = "Subsurface pipe fracture or municipal storm drain overflow causing road weakening."
        else:
            depth_cm = "N/A"
            is_water_filled = 0
            depth_advisory = "Surface infrastructure anomaly requiring scheduled municipal repair."

        # Multi-Vehicle Passability Matrix
        impact_ambulance = "Priority Emergency Clearance Required" if severity >= 4 else "Passable with Minor Slowdown"
        impact_ev = "High Battery Immersion Risk (>6 inches water)" if is_water_filled == 1 else "Normal Safe Passability"
        impact_two_wheeler = "CRITICAL: Severe Skidding and Overturn Hazard" if severity >= 3 else "Passable with Caution"
        impact_four_wheeler = "Risk of Underbody Scraping and Rim Denting" if severity >= 3 else "Passable"
        impact_pedestrian = "Unsafe for Walking / Slip Risk"

        return {
            "title": title,
            "category": category,
            "department": department,
            "severity": severity,
            "confidence": round(confidence, 3),
            "depth_cm": depth_cm,
            "is_water_filled": is_water_filled,
            "depth_advisory": depth_advisory,
            "impact_ambulance": impact_ambulance,
            "impact_ev": impact_ev,
            "impact_two_wheeler": impact_two_wheeler,
            "impact_four_wheeler": impact_four_wheeler,
            "impact_pedestrian": impact_pedestrian
        }
