"use client";

import L from "leaflet";
import "leaflet.markercluster";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { School } from "@/lib/types";

const nigeriaCenter: [number, number] = [9.082, 8.6753];

export function SchoolMap({
  schools,
  className = "h-[640px]",
}: {
  schools: School[];
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-3xl ring-1 ring-slate-200 ${className}`}>
      <MapContainer
        center={nigeriaCenter}
        zoom={6}
        minZoom={5}
        maxZoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClusterMarkers schools={schools} />
      </MapContainer>
    </div>
  );
}

function ClusterMarkers({ schools }: { schools: School[] }) {
  const map = useMap();

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      iconCreateFunction(cluster) {
        return L.divIcon({
          html: `<span>${cluster.getChildCount()}</span>`,
          className: "welfare-cluster",
          iconSize: L.point(44, 44, true),
        });
      },
    });

    schools.forEach((school) => {
      const urgentNeed =
        school.needs.find((need) => need.urgency === "Critical") ??
        school.needs[0];
      const marker = L.marker([school.latitude, school.longitude], {
        icon: L.divIcon({
          className: "welfare-marker",
          html: `<span aria-hidden="true"></span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        title: school.name,
      });

      marker.bindPopup(
        `<article class="map-popup">
          <img src="${school.images[0]}" alt="" />
          <div>
            <strong>${school.name}</strong>
            <p>${school.city}, ${school.state}</p>
            <p>${school.totalStudents.toLocaleString()} students</p>
            <p><b>Urgent:</b> ${urgentNeed.title}</p>
            <a href="/schools/${school.id}">View Profile</a>
          </div>
        </article>`,
        { minWidth: 260 },
      );

      marker.on("mouseover", () => marker.openPopup());
      group.addLayer(marker);
    });

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [map, schools]);

  return null;
}
