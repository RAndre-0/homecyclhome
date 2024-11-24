"use client";
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, Polygon } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useState, useEffect } from 'react';
import { apiService } from "@/services/api-service";

const styles = {
    map: {
        width: "100%",
        height: "80vh",
        overflow: "hidden",
        zIndex: "0"
    }
};

export default function Map() {
    const [polygons, setPolygons] = useState([]);

    useEffect(() => {
        const zones = async() => {
            try {
                let data = await apiService("zones", "GET");
                setPolygons(data);
            } catch (error) {
                console.error("Error fetching zones", error);
            }
        }
        zones();
    }, []) 
    
    const savePolygon = async (polygon) => {
        try {
            const response = await apiService('zones', 'POST', polygon);
            console.log("Zone sauvegardée :", response);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la zone :", error);
        }
    };

    const _onCreate = (e) => {
        console.log("Created");
        const newPolygon = e.layer.toGeoJSON();
        const coordinates = newPolygon.geometry.coordinates[0];

        const payload = {
            name: "Nom par défaut", // Peut être ajusté
            colour: "#FF5733", // À personnaliser
            coordinates: coordinates.map(coord => ({ longitude: coord[0], latitude: coord[1] })),
            technician: null, // À personnaliser si nécessaire
        };

        savePolygon(payload);

        // Mettre à jour l'état local
        setPolygons(prevPolygons => [...prevPolygons, payload]);
    };

    const _onEdited = () => {
        console.log("Edited");
    };

    const _onDeleted = () => {
        console.log("Deleted");
    };
    
    return (
        <MapContainer style={styles.map} center={[45.757704, 4.834099]} zoom={13} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FeatureGroup>
                <EditControl
                    position="topright"
                    onCreated={_onCreate}
                    onEdited={_onEdited}
                    onDeleted={_onDeleted}
                    draw={{
                        rectangle: false,
                        polyline: false,
                        circle: false,
                        circlemarker: false,
                        marker: false,
                    }}
                />
            </FeatureGroup>
            {polygons?.map((polygon) => (
                <Polygon
                key={polygon.id}
                positions={polygon.coordinates.map((p: any) => [p.latitude, p.longitude])}
                color={polygon.colour}
                fillColor={polygon.colour}
                eventHandlers={{
                    click: () => {
                        setZoneSelected(zone.id);
                    },
                }}
            />
            ))}

        </MapContainer>
    );
}
