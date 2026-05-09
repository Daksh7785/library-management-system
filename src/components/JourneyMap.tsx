import React, { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from 'react-simple-maps';
import type { CopyTimelineEvent } from '../types';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export const JourneyMap: React.FC<{ events: CopyTimelineEvent[] }> = ({ events }) => {
  const points = useMemo(() => {
    // For demo purposes, we generate some synthetic coordinates if none exist.
    // In production, these come from the location_geo column we added to Supabase.
    return events.map((ev, index) => {
      // Simulate random coordinates mostly in NA/EU for visual effect
      const lon = -100 + (index * 15) + (Math.random() * 10 - 5);
      const lat = 30 + (index * 5) + (Math.random() * 10 - 5);
      return {
        coordinates: [lon, lat] as [number, number],
        label: ev.eventType,
        date: new Date(ev.createdAt).toLocaleDateString()
      };
    });
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      height: '300px',
      background: 'rgba(15, 23, 42, 0.4)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#38bdf8' }}>explore</span>
          Odyssey Map
        </h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Verified Digital Journey</p>
      </div>

      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }} style={{ width: '100%', height: '100%' }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#334155" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Draw lines between points */}
        {points.map((point, index) => {
          if (index === points.length - 1) return null;
          const nextPoint = points[index + 1];
          return (
            <Line
              key={`line-${index}`}
              from={point.coordinates}
              to={nextPoint.coordinates}
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeLinecap="round"
              style={{ opacity: 0.5, strokeDasharray: "4 4" }}
            />
          );
        })}

        {/* Draw markers */}
        {points.map((point, index) => (
          <Marker key={`marker-${index}`} coordinates={point.coordinates}>
            <circle r={4} fill="#8b5cf6" stroke="#fff" strokeWidth={1.5} />
            {index === points.length - 1 && (
              <>
                <circle r={12} fill="#8b5cf6" opacity={0.3} />
                <text
                  textAnchor="middle"
                  y={-12}
                  style={{ fontFamily: "inherit", fontSize: "10px", fill: "#f8fafc", fontWeight: 600 }}
                >
                  Current
                </text>
              </>
            )}
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};
