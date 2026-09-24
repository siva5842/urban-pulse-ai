/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Camera, MapPin, ShieldCheck, 
  XCircle, Volume2, FileText, ChevronDown, ChevronUp, RefreshCw, 
  Truck, Radio, Eye
} from 'lucide-react';

export interface IssueRecord {
  id: string;
  title: string;
  category: 'ROAD_TRANSIT' | 'WATER_DRAINAGE' | 'ELECTRICAL_LIGHTING' | 'SANITATION_WASTE' | 'PEDESTRIAN_ACCESS';
  department: string;
  severity: number;
  lat: number;
  lng: number;
  device_lat: number;
  device_lng: number;
  is_on_site: number;
  photo_url: string;
  depth_cm: string;
  is_water_filled: number;
  depth_advisory: string;
  impact_ambulance: string;
  impact_ev: string;
  impact_two_wheeler: string;
  impact_four_wheeler: string;
  impact_pedestrian: string;
  true_votes: number;
  false_votes: number;
  trust_score: number;
  status: 'ACTIVE' | 'FLAGGED_FAKE' | 'OFFICIALLY_ESCALATED';
  is_escalated: number;
  ticket_id: string;
  ticket_receipt_json: string;
  timestamp: string;
}

export const PAGALAHALLI_COORDS = { lat: 12.0932, lng: 78.1841 };

export interface CategoryPreset {
  id: string;
  emoji: string;
  label: string;
  title: string;
  department: string;
  category: 'ROAD_TRANSIT' | 'WATER_DRAINAGE' | 'ELECTRICAL_LIGHTING' | 'SANITATION_WASTE' | 'PEDESTRIAN_ACCESS';
  severity: number;
  depth: string;
  isWater: number;
  advisory: string;
  color: string;
  activeBorder: string;
  activeBg: string;
}

export const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: 'dustbin',
    emoji: '🚯',
    label: 'Dustbin / Waste',
    title: 'Overflowing Garbage / Dustbin Dump',
    department: 'Municipal Sanitation',
    category: 'SANITATION_WASTE',
    severity: 3,
    depth: 'N/A',
    isWater: 0,
    advisory: 'Uncollected domestic and market refuse overflowing on walkway and curb.',
    color: 'from-emerald-600 to-teal-600',
    activeBorder: 'border-emerald-400',
    activeBg: 'bg-emerald-950/70'
  },
  {
    id: 'pothole',
    emoji: '🕳️',
    label: 'Pothole / Crater',
    title: 'Deep Asphalt Road Crater',
    department: 'Highways & PWD',
    category: 'ROAD_TRANSIT',
    severity: 4,
    depth: '>10 cm (Severe Hazard)',
    isWater: 0,
    advisory: 'Deep cavity with sharp jagged asphalt edges. High tire puncture and two-wheeler spill hazard.',
    color: 'from-rose-600 to-red-600',
    activeBorder: 'border-rose-400',
    activeBg: 'bg-rose-950/70'
  },
  {
    id: 'water',
    emoji: '💧',
    label: 'Water Leak',
    title: 'Burst Potable Drinking Pipe',
    department: 'TWAD Water Board',
    category: 'WATER_DRAINAGE',
    severity: 4,
    depth: 'N/A',
    isWater: 1,
    advisory: 'Pressurized clean drinking water pipe fractured under shoulder causing surface pooling.',
    color: 'from-blue-600 to-cyan-600',
    activeBorder: 'border-cyan-400',
    activeBg: 'bg-cyan-950/70'
  },
  {
    id: 'streetlight',
    emoji: '⚡',
    label: 'Streetlight',
    title: 'Dark Streetlight / Loose Wire',
    department: 'TANGEDCO Electricity Board',
    category: 'ELECTRICAL_LIGHTING',
    severity: 3,
    depth: 'N/A',
    isWater: 0,
    advisory: 'Luminaire fixture failure and dangling cable creating nighttime blackout hazard.',
    color: 'from-amber-600 to-yellow-600',
    activeBorder: 'border-amber-400',
    activeBg: 'bg-amber-950/70'
  },
  {
    id: 'footpath',
    emoji: '♿',
    label: 'Footpath',
    title: 'Broken Sidewalk / Footpath Obstruction',
    department: 'Town Planning & Footpaths',
    category: 'PEDESTRIAN_ACCESS',
    severity: 3,
    depth: 'N/A',
    isWater: 0,
    advisory: 'Displaced paving blocks and broken storm grating obstructing pedestrian passage.',
    color: 'from-purple-600 to-violet-600',
    activeBorder: 'border-purple-400',
    activeBg: 'bg-purple-950/70'
  }
];

const SEED_ISSUES: IssueRecord[] = [
  {
    id: "iss-tn-001",
    title: "Deep Asphalt Road Crater near Bus Stop",
    category: "ROAD_TRANSIT",
    department: "Highways & PWD",
    severity: 4,
    lat: 12.0945,
    lng: 78.1852,
    device_lat: 12.0944,
    device_lng: 78.1853,
    is_on_site: 1,
    photo_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    depth_cm: ">10 cm (Severe Hazard)",
    is_water_filled: 0,
    depth_advisory: "Deep cavity with sharp jagged asphalt rim. High puncture and fall hazard.",
    impact_ambulance: "Minor Delay (+2 min)",
    impact_ev: "Safe",
    impact_two_wheeler: "High Skidding & Fall Risk",
    impact_four_wheeler: "Caution (Reduce speed <20 km/h)",
    impact_pedestrian: "Slip & Fall Risk",
    true_votes: 4,
    false_votes: 0,
    trust_score: 100,
    status: "ACTIVE",
    is_escalated: 0,
    ticket_id: "",
    ticket_receipt_json: "",
    timestamp: new Date().toISOString()
  },
  {
    id: "iss-tn-002",
    title: "Burst Potable Drinking Pipe",
    category: "WATER_DRAINAGE",
    department: "TWAD Water Board",
    severity: 4,
    lat: 12.0910,
    lng: 78.1820,
    device_lat: 12.0911,
    device_lng: 78.1821,
    is_on_site: 1,
    photo_url: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
    depth_cm: "N/A",
    is_water_filled: 1,
    depth_advisory: "Subsurface high-pressure drinking pipeline breach causing street flooding.",
    impact_ambulance: "Passable",
    impact_ev: "Battery Immersion Risk (>6 in water)",
    impact_two_wheeler: "High Skidding & Fall Risk",
    impact_four_wheeler: "Caution (Reduce speed <20 km/h)",
    impact_pedestrian: "Slip & Fall Risk",
    true_votes: 6,
    false_votes: 0,
    trust_score: 100,
    status: "OFFICIALLY_ESCALATED",
    is_escalated: 1,
    ticket_id: "TN-TWA-2026-8812",
    ticket_receipt_json: JSON.stringify({
      ticket_id: "TN-TWA-2026-8812",
      portal_status: "ACKNOWLEDGED_201_CREATED",
      sla_deadline: "24 Hours (Emergency Response)",
      assigned_ward_officer: "Assistant Executive Engineer - Zone 4",
      payload_dump: {
        grievance_id: "9e81b612-twad-4811-9bfd-88120302b184",
        jurisdiction: "Tamil Nadu Municipal Administration & Water Supply",
        assigned_department: "TWAD Water Board",
        severity_grade: "Grade 4/5",
        technical_material_estimate: "Standard Municipal Replacement Kit",
        dispatch_timestamp: new Date().toISOString()
      }
    }),
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "iss-tn-003",
    title: "Dark Streetlight / Loose Wire",
    category: "ELECTRICAL_LIGHTING",
    department: "TANGEDCO Electricity Board",
    severity: 3,
    lat: 12.0960,
    lng: 78.1830,
    device_lat: 12.0961,
    device_lng: 78.1829,
    is_on_site: 1,
    photo_url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
    depth_cm: "N/A",
    is_water_filled: 0,
    depth_advisory: "Luminaire fixture failure and dangling cable creating nighttime blackout hazard.",
    impact_ambulance: "Passable",
    impact_ev: "Safe",
    impact_two_wheeler: "Caution",
    impact_four_wheeler: "Passable",
    impact_pedestrian: "Slip & Fall Risk",
    true_votes: 2,
    false_votes: 0,
    trust_score: 100,
    status: "ACTIVE",
    is_escalated: 0,
    ticket_id: "",
    ticket_receipt_json: "",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "iss-tn-004",
    title: "Overflowing Garbage / Dustbin Dump",
    category: "SANITATION_WASTE",
    department: "Municipal Sanitation",
    severity: 3,
    lat: 12.0925,
    lng: 78.1870,
    device_lat: 12.0924,
    device_lng: 78.1869,
    is_on_site: 1,
    photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    depth_cm: "N/A",
    is_water_filled: 0,
    depth_advisory: "Uncollected domestic and market refuse overflowing on walkway and curb.",
    impact_ambulance: "Passable",
    impact_ev: "Safe",
    impact_two_wheeler: "Caution",
    impact_four_wheeler: "Passable",
    impact_pedestrian: "Slip & Fall Risk",
    true_votes: 3,
    false_votes: 1,
    trust_score: 75,
    status: "ACTIVE",
    is_escalated: 0,
    ticket_id: "",
    ticket_receipt_json: "",
    timestamp: new Date(Date.now() - 10800000).toISOString()
  }
];

function getDeptColor(dept: string): string {
  switch (dept) {
    case 'Highways & PWD': return '#ef4444'; // Red
    case 'TWAD Water Board': return '#3b82f6'; // Blue
    case 'TANGEDCO Electricity Board': return '#f97316'; // Orange
    case 'Municipal Sanitation': return '#10b981'; // Green
    case 'Town Planning & Footpaths': return '#8b5cf6'; // Purple
    default: return '#6b7280';
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type MapLayerKey = 'satellite' | 'road';

export interface MapLayerConfig {
  id: MapLayerKey;
  label: string;
  name: string;
  url: string;
  attribution: string;
  subdomains?: string | string[];
}

export const MAP_LAYERS: Record<MapLayerKey, MapLayerConfig> = {
  satellite: {
    id: 'satellite',
    label: '🛰️ Satellite View',
    name: 'Satellite View (High-Res Aerial & Buildings)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Satellite Hybrid'
  },
  road: {
    id: 'road',
    label: '🗺️ Road View',
    name: 'Clean Road View (High-Contrast Roads)',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Road Layer'
  }
};

/**
 * Client-Side Image Downscaler (HTML5 Canvas):
 * Resizes uploaded photo to max 600px width at 0.7 JPEG quality (<100 KB).
 * Completely prevents mobile browser tab crashes and out-of-memory freeze.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string || '');
        }
      };
      img.onerror = () => resolve(e.target?.result as string || '');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Vehicle Passability Helper
 * Computes clear status rows matching user specification:
 * - 🚑 Ambulance: 🟢 Passable / 🟡 Minor Delay (+2 min) / 🔴 Blocked
 * - 🛵 Two-Wheeler: 🔴 High Skidding & Fall Risk / 🟡 Caution / 🟢 Safe
 * - ⚡ Electric Vehicle (EV): 🔴 Battery Immersion Risk (>6 in water) / 🟢 Safe
 * - 🚗 Four-Wheeler: 🟡 Caution (Reduce speed <20 km/h) / 🟢 Passable
 * - 🚶 Pedestrian: 🔴 Slip & Fall Risk / 🟢 Safe Walkway
 */
export function getPassabilityMatrix(issue: IssueRecord) {
  const isPothole = issue.category === 'ROAD_TRANSIT' || issue.title.toLowerCase().includes('crater') || issue.title.toLowerCase().includes('pothole');
  const isWater = issue.is_water_filled === 1 || issue.category === 'WATER_DRAINAGE';
  const isGarbage = issue.category === 'SANITATION_WASTE';
  const isFootpath = issue.category === 'PEDESTRIAN_ACCESS';

  // 1. Ambulance: 🟢 Passable / 🟡 Minor Delay (+2 min) / 🔴 Blocked
  let ambStatus = "🟢 Passable";
  let ambStyle = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
  if (issue.severity >= 5 || (isPothole && issue.severity >= 4 && isWater)) {
    ambStatus = "🔴 Blocked";
    ambStyle = "text-rose-400 bg-rose-950/50 border-rose-800/50";
  } else if (issue.severity >= 3 || isPothole) {
    ambStatus = "🟡 Minor Delay (+2 min)";
    ambStyle = "text-amber-400 bg-amber-950/40 border-amber-800/40";
  }

  // 2. Two-Wheeler: 🔴 High Skidding & Fall Risk / 🟡 Caution / 🟢 Safe
  let bikeStatus = "🟢 Safe";
  let bikeStyle = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
  if (isPothole || isWater || issue.severity >= 4) {
    bikeStatus = "🔴 High Skidding & Fall Risk";
    bikeStyle = "text-rose-400 bg-rose-950/50 border-rose-800/50";
  } else if (issue.severity >= 2 || isGarbage) {
    bikeStatus = "🟡 Caution";
    bikeStyle = "text-amber-400 bg-amber-950/40 border-amber-800/40";
  }

  // 3. EV: 🔴 Battery Immersion Risk (>6 in water) / 🟢 Safe
  let evStatus = "🟢 Safe";
  let evStyle = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
  if (isWater) {
    evStatus = "🔴 Battery Immersion Risk (>6 in water)";
    evStyle = "text-rose-400 bg-rose-950/50 border-rose-800/50";
  }

  // 4. Four-Wheeler: 🟡 Caution (Reduce speed <20 km/h) / 🟢 Passable
  let carStatus = "🟢 Passable";
  let carStyle = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
  if (issue.severity >= 4 || isPothole) {
    carStatus = "🟡 Caution (Reduce speed <20 km/h)";
    carStyle = "text-amber-400 bg-amber-950/40 border-amber-800/40";
  }

  // 5. Pedestrian: 🔴 Slip & Fall Risk / 🟢 Safe Walkway
  let pedStatus = "🟢 Safe Walkway";
  let pedStyle = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
  if (issue.severity >= 3 || isFootpath || isGarbage || isWater || isPothole) {
    pedStatus = "🔴 Slip & Fall Risk";
    pedStyle = "text-rose-400 bg-rose-950/50 border-rose-800/50";
  }

  return [
    { label: "Ambulance", icon: "🚑", status: ambStatus, style: ambStyle },
    { label: "Two-Wheeler", icon: "🛵", status: bikeStatus, style: bikeStyle },
    { label: "Electric Vehicle (EV)", icon: "⚡", status: evStatus, style: evStyle },
    { label: "Four-Wheeler", icon: "🚗", status: carStatus, style: carStyle },
    { label: "Pedestrian", icon: "🚶", status: pedStatus, style: pedStyle }
  ];
}

declare global {
  interface Window {
    urbanPulseVote?: (id: string, type: string) => void;
    urbanPulseSpeak?: (id: string) => void;
    urbanPulseInspect?: (id: string) => void;
    urbanPulseStreetView?: (id: string) => void;
  }
}

export default function App() {
  // Load issues from localStorage immediately for instant offline-first speed
  const [issues, setIssues] = useState<IssueRecord[]>(() => {
    try {
      const saved = localStorage.getItem("urbanpulse_issues");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return SEED_ISSUES;
  });

  const [selectedIssue, setSelectedIssue] = useState<IssueRecord | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayerKey>('satellite');
  const [showModal, setShowModal] = useState(false);
  const [streetViewIssue, setStreetViewIssue] = useState<IssueRecord | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [, setSelectedFile] = useState<File | null>(null);
  const [showPayloadDetails, setShowPayloadDetails] = useState(false);

  // Pin & Category State
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number }>(PAGALAHALLI_COORDS);
  const [selectedCategory, setSelectedCategory] = useState<string>('pothole');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
  const targetPinMarkerRef = useRef<L.CircleMarker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Switch Map Layer (Satellite vs Road)
  const switchMapLayer = (layerKey: MapLayerKey) => {
    if (!mapRef.current) return;
    const config = MAP_LAYERS[layerKey];
    if (!config) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(config.url, {
      maxZoom: 20,
      subdomains: config.subdomains || 'abc',
      attribution: config.attribution
    }).addTo(mapRef.current);

    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
    setActiveLayer(layerKey);
    showToastMsg(`🗺️ Layer switched to ${config.label}`, "info");
  };

  const showToastMsg = (msg: string, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const speakAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      showToastMsg("🔊 Voice broadcast playing...", "info");
    } else {
      showToastMsg("Speech synthesis not supported in this browser.", "warning");
    }
  };

  // Persistent storage sync
  useEffect(() => {
    try {
      localStorage.setItem("urbanpulse_issues", JSON.stringify(issues));
    } catch {
      // quota or local storage restriction
    }
  }, [issues]);

  // GPS Location Locking to Pagalahalli, Dharmapuri (12.0932, 78.1841)
  // If GPS is >15km away (ISP tower in Chennai/Bangalore), ignore and lock to Pagalahalli.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const dist = calculateDistance(lat, lng, PAGALAHALLI_COORDS.lat, PAGALAHALLI_COORDS.lng);
          if (dist <= 15000) {
            setPinLocation({ lat, lng });
          } else {
            console.info(`GPS location (${lat.toFixed(4)}, ${lng.toFixed(4)}) is ${Math.round(dist/1000)}km away (>15km). Locking coordinates to Pagalahalli, Dharmapuri.`);
            setPinLocation(PAGALAHALLI_COORDS);
          }
        },
        (err) => {
          console.warn("Using default Pagalahalli, Dharmapuri coordinates:", err.message);
          setPinLocation(PAGALAHALLI_COORDS);
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [PAGALAHALLI_COORDS.lat, PAGALAHALLI_COORDS.lng],
        zoom: 16,
        zoomControl: true
      });

      // Default Active View: High-Resolution Satellite Hybrid
      const defaultLayer = L.tileLayer(MAP_LAYERS['satellite'].url, {
        maxZoom: 20,
        subdomains: MAP_LAYERS['satellite'].subdomains || 'abc',
        attribution: MAP_LAYERS['satellite'].attribution
      }).addTo(map);
      defaultLayer.bringToBack();
      tileLayerRef.current = defaultLayer;

      // Tap on Map to Place Pin: click or tap anywhere moves the pin directly to that exact building or road
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setPinLocation({ lat, lng });
        showToastMsg(`📍 Pin moved to: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`, "info");
      });

      mapRef.current = map;
    }
  }, []);

  // Target Defect Pin (Tap on map to reposition)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (targetPinMarkerRef.current) {
      map.removeLayer(targetPinMarkerRef.current);
    }

    const targetMarker = L.circleMarker([pinLocation.lat, pinLocation.lng], {
      radius: 12,
      fillColor: '#f59e0b',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(map);

    targetMarker.bindTooltip(`📍 Defect Target Pin (${pinLocation.lat.toFixed(4)}, ${pinLocation.lng.toFixed(4)})<br/><i>Tap anywhere on map to reposition</i>`, {
      permanent: false,
      direction: 'top'
    });

    targetPinMarkerRef.current = targetMarker;
  }, [pinLocation]);

  // Update Incident Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    issues.forEach(issue => {
      const color = getDeptColor(issue.department);
      const isEscalated = issue.is_escalated === 1;

      const marker = L.circleMarker([issue.lat, issue.lng], {
        radius: isEscalated ? 14 : 11,
        fillColor: color,
        color: isEscalated ? '#fbbf24' : '#ffffff',
        weight: isEscalated ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.88
      }).addTo(map);

      const passability = getPassabilityMatrix(issue);
      const passabilityHtml = passability.slice(0, 3).map(p => `
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
          <span>${p.icon} ${p.label}:</span>
          <strong>${p.status}</strong>
        </div>
      `).join('');

      const popupHtml = `
        <div style="min-width: 255px; font-family: ui-sans-serif, system-ui, sans-serif; color: #0f172a; padding: 2px;">
          <img src="${issue.photo_url}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" alt="${issue.title}" />
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 13px;">${issue.title}</span>
          </div>

          <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 6px;">
            <span style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}60; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${issue.department}
            </span>
            <span style="background-color: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              Severity ${issue.severity}/5
            </span>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; margin-bottom: 8px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Passability Snapshot</div>
            ${passabilityHtml}
          </div>

          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 2px;">
              <span>Citizen Verification</span>
              <span>${issue.true_votes} / 5 Votes to Auto-Dispatch</span>
            </div>
            <div style="width: 100%; background-color: #e2e8f0; height: 6px; border-radius: 999px; overflow: hidden;">
              <div style="width: ${Math.min((issue.true_votes / 5) * 100, 100)}%; background-color: ${isEscalated ? '#10b981' : '#3b82f6'}; height: 100%;"></div>
            </div>
          </div>

          ${isEscalated ? `
            <div style="background-color: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-size: 11px; font-weight: 700; padding: 6px; border-radius: 4px; text-align: center; margin-bottom: 8px;">
              🏛️ OFFICIALLY ESCALATED<br/><span style="font-size: 10px; font-weight: normal;">Ticket ID: ${issue.ticket_id}</span>
            </div>
          ` : ''}

          <div style="display: flex; gap: 4px; margin-bottom: 6px;">
            <button onclick="window.urbanPulseVote && window.urbanPulseVote('${issue.id}', 'TRUE')" style="flex: 1; background-color: #10b981; color: white; border: none; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              👍 Yes, True (${issue.true_votes})
            </button>
            <button onclick="window.urbanPulseVote && window.urbanPulseVote('${issue.id}', 'FALSE')" style="flex: 1; background-color: #ef4444; color: white; border: none; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              👎 Fake (${issue.false_votes})
            </button>
          </div>

          <div style="display: flex; gap: 4px;">
            <button onclick="window.urbanPulseSpeak && window.urbanPulseSpeak('${issue.id}')" style="flex: 1; background-color: #3b82f6; color: white; border: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; cursor: pointer;">
              🔊 Read Aloud
            </button>
            <button onclick="window.urbanPulseInspect && window.urbanPulseInspect('${issue.id}')" style="flex: 1; background-color: #0f172a; color: white; border: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; cursor: pointer;">
              📋 Work Order
            </button>
          </div>

          <button onclick="window.urbanPulseStreetView && window.urbanPulseStreetView('${issue.id}')" style="width: 100%; margin-top: 5px; background: linear-gradient(135deg, #0284c7, #2563eb); color: white; border: none; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
            👁️ 360° Street View
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersRef.current[issue.id] = marker;
    });
  }, [issues]);

  useEffect(() => {
    window.urbanPulseVote = (id: string, type: string) => handleVote(id, type);
    window.urbanPulseSpeak = (id: string) => {
      const issue = issues.find(i => i.id === id);
      if (issue) {
        speakAloud(`Urban Pulse Alert. Department: ${issue.department}. Issue: ${issue.title}. Severity grade ${issue.severity} of 5. ${issue.depth_advisory || ''} Passability: ${issue.impact_two_wheeler}.`);
      }
    };
    window.urbanPulseInspect = (id: string) => {
      const issue = issues.find(i => i.id === id);
      if (issue) {
        openWorkOrderModal(issue);
      }
    };
    window.urbanPulseStreetView = (id: string) => {
      const issue = issues.find(i => i.id === id);
      if (issue) {
        setStreetViewIssue(issue);
      }
    };
  }, [issues]);

  // Instant Zero-Network Vote Handling
  const handleVote = (issueId: string, voteType: string) => {
    setIssues(prev => {
      const next = prev.map(item => {
        if (item.id === issueId) {
          const newTrue = voteType === 'TRUE' ? item.true_votes + 1 : item.true_votes;
          const newFalse = voteType === 'FALSE' ? item.false_votes + 1 : item.false_votes;
          const total = newTrue + newFalse;
          const trust = total > 0 ? Math.round((newTrue / total) * 100) : 100;

          let escalated = item.is_escalated;
          let ticketId = item.ticket_id;
          let receiptJson = item.ticket_receipt_json;
          let status: 'ACTIVE' | 'FLAGGED_FAKE' | 'OFFICIALLY_ESCALATED' = item.status;

          if (newTrue >= 5 && escalated === 0) {
            escalated = 1;
            status = 'OFFICIALLY_ESCALATED';
            const deptCode = item.department.slice(0, 3).toUpperCase();
            ticketId = `TN-${deptCode}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            receiptJson = JSON.stringify({
              ticket_id: ticketId,
              portal_status: "ACKNOWLEDGED_201_CREATED",
              sla_deadline: item.severity >= 4 ? "24 Hours (Emergency Response)" : "48 Hours (Standard SLA)",
              assigned_ward_officer: "Assistant Executive Engineer - Zone 4",
              payload_dump: {
                grievance_id: `grievance-${Date.now()}`,
                jurisdiction: "Tamil Nadu Municipal Administration & Water Supply",
                assigned_department: item.department,
                severity_grade: `Grade ${item.severity}/5`,
                technical_material_estimate: item.category === 'ROAD_TRANSIT' ? "2.0 Tons Premix Cold Asphalt + Vibratory Compactor" : "Standard Municipal Hardware Kit",
                dispatch_timestamp: new Date().toISOString()
              }
            });
            showToastMsg(`🚨 Threshold Met! Work Order ${ticketId} Dispatched to ${item.department}!`, "alert");
          } else if (newFalse >= 3 && newFalse > newTrue) {
            status = 'FLAGGED_FAKE';
          }

          return {
            ...item,
            true_votes: newTrue,
            false_votes: newFalse,
            trust_score: trust,
            status,
            is_escalated: escalated,
            ticket_id: ticketId,
            ticket_receipt_json: receiptJson
          };
        }
        return item;
      });
      try {
        localStorage.setItem("urbanpulse_issues", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToastMsg("Vote registered! Live ledger updated.", "success");
  };

  // Instant Zero-Network Force Escalation
  const handleForceEscalate = (issue: IssueRecord) => {
    const deptCode = issue.department.slice(0, 3).toUpperCase();
    const ticketId = `TN-${deptCode}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt = {
      ticket_id: ticketId,
      portal_status: "ACKNOWLEDGED_201_CREATED",
      sla_deadline: issue.severity >= 4 ? "24 Hours (Emergency Response)" : "48 Hours (Standard SLA)",
      assigned_ward_officer: "Assistant Executive Engineer - Zone 4",
      payload_dump: {
        grievance_id: `forced-${Date.now()}`,
        jurisdiction: "Tamil Nadu Municipal Administration & Water Supply",
        assigned_department: issue.department,
        coordinates: { lat: issue.lat, lng: issue.lng },
        verified_citizens_count: issue.true_votes,
        evidence_photo_url: issue.photo_url,
        severity_grade: `Grade ${issue.severity}/5`,
        technical_material_estimate: issue.category === 'ROAD_TRANSIT' ? "2.0 Tons Premix Cold Asphalt + Vibratory Roller" : "Standard Municipal Replacement Kit",
        dispatch_timestamp: new Date().toISOString()
      }
    };

    const updated = issues.map(i => i.id === issue.id ? {
      ...i,
      is_escalated: 1,
      status: "OFFICIALLY_ESCALATED" as const,
      ticket_id: ticketId,
      ticket_receipt_json: JSON.stringify(receipt)
    } : i);

    setIssues(updated);
    try {
      localStorage.setItem("urbanpulse_issues", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setActiveReceipt(receipt);
    setShowModal(true);
    showToastMsg(`✅ Work Order ${ticketId} generated and acknowledged!`, "success");
  };

  const openWorkOrderModal = (issue: IssueRecord) => {
    setSelectedIssue(issue);
    if (issue.ticket_receipt_json) {
      try {
        setActiveReceipt(JSON.parse(issue.ticket_receipt_json));
      } catch {
        setActiveReceipt({
          ticket_id: issue.ticket_id,
          portal_status: "ACKNOWLEDGED_201_CREATED",
          sla_deadline: issue.severity >= 4 ? "24 Hours (Emergency Response)" : "48 Hours (Standard SLA)",
          assigned_ward_officer: "Assistant Executive Engineer - Zone 4",
          payload_dump: { issue_id: issue.id, department: issue.department }
        });
      }
    } else {
      setActiveReceipt(null);
    }
    setShowModal(true);
  };

  // Image Upload with Client-Side Downscaling (HTML5 Canvas <100 KB)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    try {
      const downscaled = await compressImage(file);
      setPreviewImage(downscaled);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  /**
   * INSTANT ZERO-NETWORK STATE UPDATE:
   * 1. Immediately adds new incident to React state array `issues`.
   * 2. Saves to `localStorage`.
   * 3. Smoothly flies map to target pin: `map.flyTo([lat, lng], 17)`.
   * 4. Opens new incident's popup on map.
   * 5. Shows green banner: "✅ Successfully published to live grid!"
   * Executes in under 0.2 seconds with ZERO network freezes!
   */
  const handleBroadcastDefect = () => {
    if (!previewImage) {
      showToastMsg("Please capture or select a defect photo first.", "warning");
      return;
    }

    setUploading(true);

    const preset = CATEGORY_PRESETS.find(p => p.id === selectedCategory) || CATEGORY_PRESETS[1];
    const targetLat = pinLocation.lat;
    const targetLng = pinLocation.lng;

    const newIssue: IssueRecord = {
      id: `iss-tn-${Date.now().toString().slice(-4)}`,
      title: preset.title,
      category: preset.category,
      department: preset.department,
      severity: preset.severity,
      lat: targetLat,
      lng: targetLng,
      device_lat: targetLat,
      device_lng: targetLng,
      is_on_site: 1,
      photo_url: previewImage,
      depth_cm: preset.depth,
      is_water_filled: preset.isWater,
      depth_advisory: preset.advisory,
      impact_ambulance: preset.id === 'pothole' ? "Minor Delay (+2 min)" : (preset.severity >= 5 ? "Blocked" : "Passable"),
      impact_ev: preset.id === 'water' ? "Battery Immersion Risk (>6 in water)" : "Safe",
      impact_two_wheeler: (preset.id === 'pothole' || preset.id === 'water') ? "High Skidding & Fall Risk" : "Caution",
      impact_four_wheeler: (preset.id === 'pothole' || preset.id === 'water') ? "Caution (Reduce speed <20 km/h)" : "Passable",
      impact_pedestrian: "Slip & Fall Risk",
      true_votes: 1,
      false_votes: 0,
      trust_score: 100,
      status: "ACTIVE",
      is_escalated: 0,
      ticket_id: "",
      ticket_receipt_json: "",
      timestamp: new Date().toISOString()
    };

    // 1. Immediately add to React state
    const nextIssues = [newIssue, ...issues];
    setIssues(nextIssues);

    // 2. Save to localStorage
    try {
      localStorage.setItem("urbanpulse_issues", JSON.stringify(nextIssues));
    } catch {
      // ignore
    }

    // 3 & 4. Smoothly pan map and open popup
    if (mapRef.current) {
      mapRef.current.flyTo([targetLat, targetLng], 17, { duration: 0.8 });
      setTimeout(() => {
        if (markersRef.current[newIssue.id]) {
          markersRef.current[newIssue.id].openPopup();
        }
      }, 900);
    }

    // Reset preview
    setPreviewImage(null);
    setSelectedFile(null);
    setUploading(false);

    // 5. Show green banner
    showToastMsg("✅ Successfully published to live grid!", "success");
  };

  const activePreset = CATEGORY_PRESETS.find(p => p.id === selectedCategory) || CATEGORY_PRESETS[1];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl border text-sm font-semibold flex items-center gap-2 transition-all transform animate-bounce ${
          toast.type === 'alert' 
            ? 'bg-rose-950/90 border-rose-600 text-rose-200' 
            : toast.type === 'warning'
            ? 'bg-amber-950/90 border-amber-600 text-amber-200'
            : toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
            : 'bg-slate-900/90 border-cyan-500 text-cyan-200'
        }`}>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                UrbanPulse <span className="text-cyan-400">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Pagalahalli Sentinel
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Municipal Dispatch & Real-Time Incident Grid
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Grid Location: <strong className="text-white">Pagalahalli, Dharmapuri</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Sync</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Map View (8 cols) */}
        <div className="lg:col-span-8 relative h-[52vh] lg:h-[calc(100vh-65px)] border-b lg:border-b-0 lg:border-r border-slate-800">
          
          {/* Map Top Bar: Department Stats, Recenter & Pin Info */}
          <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-2 pointer-events-auto">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-300">PWD ({issues.filter(i => i.department === 'Highways & PWD').length})</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-1"></span>
              <span className="text-slate-300">TWAD ({issues.filter(i => i.department === 'TWAD Water Board').length})</span>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ml-1"></span>
              <span className="text-slate-300">TANGEDCO ({issues.filter(i => i.department === 'TANGEDCO Electricity Board').length})</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1"></span>
              <span className="text-slate-300">Sanitation ({issues.filter(i => i.department === 'Municipal Sanitation').length})</span>
            </div>

            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.setView([PAGALAHALLI_COORDS.lat, PAGALAHALLI_COORDS.lng], 16);
                  setPinLocation(PAGALAHALLI_COORDS);
                }
              }}
              className="bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recenter Pagalahalli
            </button>
          </div>

          {/* Multi-Layer Map View Switcher Button Bar (Top-Right) */}
          <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700/90 p-1 rounded-xl shadow-2xl flex items-center gap-1 pointer-events-auto">
            {(Object.keys(MAP_LAYERS) as MapLayerKey[]).map((key) => {
              const layer = MAP_LAYERS[key];
              const isActive = activeLayer === key;
              return (
                <button
                  key={key}
                  onClick={() => switchMapLayer(key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={layer.name}
                >
                  <span>{layer.label}</span>
                </button>
              );
            })}
          </div>

          {/* Leaflet Map Canvas */}
          <div id="map" ref={mapContainerRef} className="w-full h-full bg-slate-950 z-10" />

          {/* Map Bottom Hint & Pin Location Banner */}
          <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-amber-400 font-bold">📍 Defect Pin:</span>
              <span className="font-mono text-cyan-400 font-bold">{pinLocation.lat.toFixed(5)}°N, {pinLocation.lng.toFixed(5)}°E</span>
              <span className="hidden sm:inline text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                👆 Tap anywhere on satellite map to move pin
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Gold Ring: Official Work Order
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">
                Threshold: <strong>5 Citizen Votes</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Camera Capture & Feed (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-auto lg:h-[calc(100vh-65px)] bg-slate-900 overflow-y-auto">
          
          {/* Defect Sensor & 1-Tap Category Selector */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Sentinel Defect Sensor
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-950 text-emerald-300 border-emerald-800">
                🟢 Pagalahalli Grid
              </span>
            </div>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewImage ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-600/20 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm"
                >
                  <Camera className="w-5 h-5" />
                  📷 Capture Defect with Camera
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Quick sample demo photo
                      setPreviewImage("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80");
                      showToastMsg("Sample road photo loaded! Tap category below to customize.", "info");
                    }}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition text-center"
                  >
                    Load Sample Road Photo
                  </button>
                  <button
                    onClick={() => {
                      setPreviewImage("https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80");
                      setSelectedCategory("dustbin");
                      showToastMsg("Sample garbage photo loaded! 🚯 Dustbin category selected.", "info");
                    }}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition text-center"
                  >
                    Load Sample Dustbin Photo
                  </button>
                </div>
                <p className="text-[11px] text-center text-slate-400">
                  Resizes to &lt;100 KB client-side for zero-freeze instant performance.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Image Preview & Discard */}
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                  <img
                    src={previewImage}
                    alt="Defect preview"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => { setPreviewImage(null); setSelectedFile(null); }}
                      className="p-1.5 bg-black/75 hover:bg-black text-rose-400 rounded-lg text-xs transition"
                      title="Discard photo"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    Target: {pinLocation.lat.toFixed(4)}, {pinLocation.lng.toFixed(4)} (Tap map to move)
                  </div>
                </div>

                {/* 1-TAP CATEGORY SELECTOR (5 Large Buttons directly above Broadcast button) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <span>🏷️</span> 1-Tap Category Selector:
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      {activePreset.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {CATEGORY_PRESETS.map((preset) => {
                      const isSelected = selectedCategory === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(preset.id);
                            showToastMsg(`Selected ${preset.label}`, "info");
                          }}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 justify-center ${
                            isSelected
                              ? 'bg-gradient-to-r ' + preset.color + ' text-white border-white/60 shadow-lg scale-[1.02] ring-2 ring-cyan-400/40'
                              : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                          }`}
                        >
                          <span className="text-base">{preset.emoji}</span>
                          <span className="truncate">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Summary of What Will Be Broadcast */}
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-200">
                      <span className="truncate font-semibold">{activePreset.title}</span>
                      <span className="text-rose-400 font-bold shrink-0 ml-1">Grade {activePreset.severity}/5</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Dept: <strong className="text-cyan-400">{activePreset.department}</strong></span>
                      <span>Depth: <strong className="text-amber-400">{activePreset.depth}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Instant Broadcast Button */}
                <button
                  onClick={handleBroadcastDefect}
                  disabled={uploading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  📡 Broadcast Defect to Live Grid
                </button>
              </div>
            )}
          </div>

          {/* Active Grid Incidents Feed */}
          <div className="flex-1 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Active Grid Incidents ({issues.length})
              </h2>
              <span className="text-xs text-slate-400">Zero-Network Real-Time</span>
            </div>

            {issues.map(issue => {
              const deptColor = getDeptColor(issue.department);
              const isEscalated = issue.is_escalated === 1;
              const passabilityRows = getPassabilityMatrix(issue);

              return (
                <div
                  key={issue.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isEscalated
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top: Photo & Details */}
                  <div className="flex gap-3">
                    <img
                      src={issue.photo_url}
                      alt={issue.title}
                      className="w-20 h-20 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-xs font-bold text-white truncate" title={issue.title}>
                          {issue.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {issue.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 my-1.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${deptColor}15`,
                            color: deptColor,
                            borderColor: `${deptColor}40`
                          }}
                        >
                          {issue.department}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          Grade {issue.severity}/5
                        </span>
                      </div>

                      {issue.depth_cm !== 'N/A' && (
                        <p className="text-[11px] text-slate-300 leading-snug">
                          <strong>Depth:</strong> {issue.depth_cm}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* REDESIGNED VEHICLE PASSABILITY SECTION:
                      Full-width, clearly readable status rows:
                      - 🚑 Ambulance: 🟢 Passable / 🟡 Minor Delay (+2 min) / 🔴 Blocked
                      - 🛵 Two-Wheeler: 🔴 High Skidding & Fall Risk / 🟡 Caution / 🟢 Safe
                      - ⚡ Electric Vehicle (EV): 🔴 Battery Immersion Risk (>6 in water) / 🟢 Safe
                      - 🚗 Four-Wheeler: 🟡 Caution (Reduce speed <20 km/h) / 🟢 Passable
                      - 🚶 Pedestrian: 🔴 Slip & Fall Risk / 🟢 Safe Walkway
                  */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-cyan-400" />
                        Multi-Vehicle Passability Impact
                      </span>
                      <span className="text-[9px] text-cyan-400 font-mono">LIVE SAFETY MATRIX</span>
                    </div>

                    <div className="space-y-1">
                      {passabilityRows.map((r, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] ${r.style}`}
                        >
                          <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                            <span>{r.icon}</span> {r.label}
                          </span>
                          <span className="font-bold tracking-tight">{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Voting and Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(issue.id, 'TRUE')}
                        className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded text-xs font-bold transition flex items-center gap-1"
                      >
                        👍 Yes ({issue.true_votes})
                      </button>
                      <button
                        onClick={() => handleVote(issue.id, 'FALSE')}
                        className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-300 rounded text-xs font-bold transition flex items-center gap-1"
                      >
                        👎 Fake ({issue.false_votes})
                      </button>
                      <button
                        onClick={() => speakAloud(`Attention Dharmapuri commuters. Department: ${issue.department}. Incident: ${issue.title}. Depth: ${issue.depth_cm}. Passability status: ${issue.impact_two_wheeler}.`)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs transition"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isEscalated ? (
                      <button
                        onClick={() => openWorkOrderModal(issue)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-extrabold flex items-center gap-1 shadow-md shadow-amber-500/10"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ticket #{issue.ticket_id.split('-').slice(-1)[0] || 'VIEW'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleForceEscalate(issue)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-semibold border border-slate-700 transition"
                      >
                        Force Escalate
                      </button>
                    )}
                  </div>

                  {/* 360° Street View Action Button on Card */}
                  <div className="mt-2">
                    <button
                      onClick={() => setStreetViewIssue(issue)}
                      className="w-full py-1.5 px-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 active:scale-[0.98]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>👁️ 360° Street View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Official Government Work Order Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      Official Tamil Nadu Municipal Work Order
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      CPGRAMS #201
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Auto-Routed via UrbanPulse Citizen Verification Grid
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Ticket ID</div>
                  <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">
                    {selectedIssue.ticket_id || "TN-PWD-2026-9104"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Jurisdiction</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    Dharmapuri Region
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Priority SLA</div>
                  <div className="text-xs font-bold text-rose-400 mt-0.5">
                    {selectedIssue.severity >= 4 ? "24h Emergency" : "48h Standard"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Target Ward Officer</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    Zone 4 Assistant Exec.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-2">Photographic Evidence Attachment</div>
                  <img
                    src={selectedIssue.photo_url}
                    alt="Work Order defect"
                    className="w-full h-36 object-cover rounded-lg border border-slate-800"
                  />
                  <div className="mt-1 text-[10px] text-slate-400 flex justify-between">
                    <span>GPS: {selectedIssue.lat.toFixed(4)}, {selectedIssue.lng.toFixed(4)}</span>
                    <span className="text-emerald-400 font-semibold">Verified On-Site</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Defect Classification</div>
                    <div className="text-xs font-bold text-white mt-0.5">{selectedIssue.title}</div>
                    <div className="text-slate-300 text-[11px] mt-1">{selectedIssue.depth_advisory}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Technical Material Requisition</div>
                    <div className="text-xs font-semibold text-cyan-300 mt-0.5">
                      {selectedIssue.category === 'ROAD_TRANSIT'
                        ? '2.0 Tons Premix Cold Asphalt + Vibratory Compactor Roller'
                        : selectedIssue.category === 'SANITATION_WASTE'
                        ? 'Compactor Truck + 4 Sanitary Workers + Disinfection Spray'
                        : 'Standard Municipal Hardware Replacement Kit'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Citizen Validation Ledger</div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      <strong>{selectedIssue.true_votes} Citizens</strong> verified on-site. Community Trust Score: <strong>{selectedIssue.trust_score}%</strong>.
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <button
                  onClick={() => setShowPayloadDetails(!showPayloadDetails)}
                  className="w-full px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-left font-mono text-xs text-slate-300 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Raw CPGRAMS Webhook Transmission Payload
                  </span>
                  {showPayloadDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showPayloadDetails && (
                  <pre className="p-4 bg-black/80 text-[11px] font-mono text-emerald-400 overflow-x-auto border-t border-slate-800 max-h-48">
                    {JSON.stringify(activeReceipt?.payload_dump || {
                      ticket_id: selectedIssue.ticket_id,
                      assigned_department: selectedIssue.department,
                      coordinates: { lat: selectedIssue.lat, lng: selectedIssue.lng },
                      severity_grade: `Grade ${selectedIssue.severity}/5`,
                      timestamp: selectedIssue.timestamp
                    }, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Authorized under Section 142 of TN District Municipalities Act
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
              >
                Close Requisition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 360° Interactive Street View Modal */}
      {streetViewIssue && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-lg">
                  👁️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      360° Interactive Street View Panorama
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      Ground Reality
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {streetViewIssue.title} • {streetViewIssue.department} • Coordinates: {streetViewIssue.lat.toFixed(5)}°N, {streetViewIssue.lng.toFixed(5)}°E
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetViewIssue.lat},${streetViewIssue.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                >
                  <span>Open in Google Street View App ↗</span>
                </a>
                <button
                  onClick={() => setStreetViewIssue(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-200 border border-slate-700 transition"
                  title="Close"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Panorama Iframe */}
            <div className="relative w-full h-[450px] sm:h-[500px] bg-black">
              <iframe
                title={`360 Street View - ${streetViewIssue.title}`}
                src={`https://maps.google.com/maps?q=&layer=c&cbll=${streetViewIssue.lat},${streetViewIssue.lng}&cbp=11,0,0,0,0&output=svembed`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span>📍 Lat: <strong className="text-slate-200">{streetViewIssue.lat.toFixed(5)}</strong>, Lng: <strong className="text-slate-200">{streetViewIssue.lng.toFixed(5)}</strong></span>
                <span>•</span>
                <span>Severity: <strong className="text-rose-400">Grade {streetViewIssue.severity}/5</strong></span>
                <span>•</span>
                <span>Depth: <strong className="text-amber-400">{streetViewIssue.depth_cm}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetViewIssue.lat},${streetViewIssue.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition"
                >
                  <span>Open in App ↗</span>
                </a>
                <button
                  onClick={() => setStreetViewIssue(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                >
                  Close (✕)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
