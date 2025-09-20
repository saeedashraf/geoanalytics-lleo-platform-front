'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Coordinates, AreaOfInterest } from '@/types/analysis';
import { Calculator, MapPin, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

// Fix for default markers in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface InteractiveMapProps {
  onAreaSelect: (area: AreaOfInterest) => void;
  selectedArea?: AreaOfInterest | null;
  className?: string;
}

// Component to handle map events
const MapEventHandler = ({ onAreaSelect }: { onAreaSelect: (area: AreaOfInterest) => void }) => {
  useMapEvents({
    draw_created: (e: any) => {
      const { layer } = e;
      if (layer instanceof L.Rectangle) {
        const bounds = layer.getBounds();
        const coordinates: Coordinates = {
          southwest_lat: bounds.getSouth(),
          southwest_lon: bounds.getWest(),
          northeast_lat: bounds.getNorth(),
          northeast_lon: bounds.getEast(),
        };
        
        const center = bounds.getCenter();
        const area_km2 = calculateAreaKm2(coordinates);
        
        const areaOfInterest: AreaOfInterest = {
          coordinates,
          area_km2,
          center: {
            lat: center.lat,
            lng: center.lng,
          },
        };
        
        onAreaSelect(areaOfInterest);
      }
    },
  });
  
  return null;
};

// Calculate area in square kilometers
const calculateAreaKm2 = (coords: Coordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (coords.northeast_lat - coords.southwest_lat) * Math.PI / 180;
  const dLon = (coords.northeast_lon - coords.southwest_lon) * Math.PI / 180;
  const avgLat = (coords.northeast_lat + coords.southwest_lat) / 2 * Math.PI / 180;
  
  const latDistance = R * dLat;
  const lonDistance = R * dLon * Math.cos(avgLat);
  
  return Math.abs(latDistance * lonDistance);
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  onAreaSelect, 
  selectedArea, 
  className = '' 
}) => {
  const [mapKey, setMapKey] = useState(0);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  
  const handleClearSelection = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    onAreaSelect({
      coordinates: {
        southwest_lat: 0,
        southwest_lon: 0,
        northeast_lat: 0,
        northeast_lon: 0,
      },
    });
    setMapKey(prev => prev + 1); // Force re-render
  };
  
  // Default map center (Zurich)
  const defaultCenter: [number, number] = [47.3769, 8.5417];
  
  return (
    <div className={`relative ${className}`}>
      {/* Map container */}
      <div className="relative rounded-lg overflow-hidden shadow-soft border border-primary-200">
        <MapContainer
          key={mapKey}
          center={defaultCenter}
          zoom={10}
          className="h-full w-full min-h-[400px]"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Satellite layer option */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            opacity={0}
          />
          
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={(e: any) => {
                // Handle the created event
                const { layer } = e;
                if (layer instanceof L.Rectangle) {
                  const bounds = layer.getBounds();
                  const coordinates: Coordinates = {
                    southwest_lat: bounds.getSouth(),
                    southwest_lon: bounds.getWest(),
                    northeast_lat: bounds.getNorth(),
                    northeast_lon: bounds.getEast(),
                  };
                  
                  const center = bounds.getCenter();
                  const area_km2 = calculateAreaKm2(coordinates);
                  
                  const areaOfInterest: AreaOfInterest = {
                    coordinates,
                    area_km2,
                    center: {
                      lat: center.lat,
                      lng: center.lng,
                    },
                  };
                  
                  onAreaSelect(areaOfInterest);
                }
              }}
              draw={{
                rectangle: {
                  shapeOptions: {
                    color: '#f37d16',
                    weight: 2,
                    fillOpacity: 0.2,
                  },
                },
                polygon: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
              edit={{
                edit: false,
                remove: false,
              }}
            />
          </FeatureGroup>
          
          <MapEventHandler onAreaSelect={onAreaSelect} />
        </MapContainer>
        
        {/* Map overlay with instructions */}
        <div className="absolute top-4 left-4 z-[1000]">
          <Card glass padding="sm" className="max-w-xs">
            <div className="flex items-start space-x-2">
              <MapPin className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-primary-900 text-sm">Select Analysis Area</h4>
                <p className="text-xs text-primary-600 mt-1">
                  Use the rectangle tool (📦) to draw your area of interest on the map
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Clear button */}
        {selectedArea && selectedArea.coordinates.northeast_lat !== 0 && (
          <div className="absolute top-4 right-4 z-[1000]">
            <Button
              variant="error"
              size="sm"
              onClick={handleClearSelection}
              className="shadow-lg"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>
      
      {/* Selected area information */}
      {selectedArea && selectedArea.coordinates.northeast_lat !== 0 && (
        <Card className="mt-4" padding="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-accent-600" />
              <div>
                <h4 className="font-medium text-primary-900">Selected Area</h4>
                <p className="text-sm text-primary-600">
                  {selectedArea.area_km2?.toFixed(2)} km² selected for analysis
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-primary-500">Coordinates</p>
              <p className="text-xs font-mono text-primary-700">
                {selectedArea.coordinates.southwest_lat.toFixed(4)}, {selectedArea.coordinates.southwest_lon.toFixed(4)}
              </p>
              <p className="text-xs font-mono text-primary-700">
                to {selectedArea.coordinates.northeast_lat.toFixed(4)}, {selectedArea.coordinates.northeast_lon.toFixed(4)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InteractiveMap;