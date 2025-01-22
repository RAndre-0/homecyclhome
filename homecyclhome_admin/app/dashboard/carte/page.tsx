"use client";
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useState, useEffect, useRef } from 'react';
import { apiService } from "@/services/api-service";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const styles = {
    map: {
        width: "100%",
        height: "80vh",
        overflow: "hidden",
        zIndex: "0",
    },
};

export default function Map() {
    const [polygons, setPolygons] = useState([]);
    const [zoneSelected, setZoneSelected] = useState(null);
    const [technicians, setTechnicians] = useState([]);

    // Référence pour le FeatureGroup
    const featureGroupRef = useRef(null);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const data = await apiService("zones", "GET");
                setPolygons(data);
            } catch (error) {
                console.error("Error fetching zones", error);
            }
        };
        fetchZones();
        const fetchTechnicians = async () => {
            try {
                const fetchedTechnicians = await apiService("users/ROLE_TECHNICIEN", "GET");
                setTechnicians(fetchedTechnicians);
            } catch (error) {
                console.error("Error fetching technicians", error);
            }
        };
        fetchTechnicians();
    }, []);

    const savePolygon = async (polygon) => {
        try {
            const response = await apiService("zones", "POST", polygon);
            setPolygons((prevPolygons) => [...prevPolygons, { ...polygon, id: response.id }]);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la zone :", error);
        }
    };

    const updatePolygon = async (polygon) => {
        try {
            await apiService(`zones/${polygon.id}/edit`, "PUT", polygon);
            setPolygons((prevPolygons) =>
                prevPolygons.map((p) => (p.id === polygon.id ? polygon : p))
            );
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la zone ${polygon.id} :`, error);
        }
    };

    const deletePolygon = async (id) => {
        try {
            await apiService(`zones/${id}`, "DELETE");
            setPolygons((prevPolygons) => prevPolygons.filter((polygon) => polygon.id !== id));
        } catch (error) {
            console.error(`Erreur lors de la suppression de la zone ${id} :`, error);
        }
    };

    const _onCreate = (e) => {
        const newPolygon = e.layer.toGeoJSON();
        const coordinates = newPolygon.geometry.coordinates[0];

        const payload = {
            name: "Nom par défaut",
            color: "#FF5733",
            coordinates: coordinates.map((coord) => ({ longitude: coord[0], latitude: coord[1] })),
            technician: null,
        };

        savePolygon(payload);
    };

    const _onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const updatedPolygon = layer.toGeoJSON();
            const id = layer.options.id;
            const coordinates = updatedPolygon.geometry.coordinates[0];

            const payload = {
                id,
                name: "Nom modifié",
                color: "#FF5733",
                coordinates: coordinates.map((coord) => ({ longitude: coord[0], latitude: coord[1] })),
                technician: null,
            };

            updatePolygon(payload);
        });
    };

    const _onDeleted = (e) => {
        const layers = e.layers;
        const idsToDelete = [];

        layers.eachLayer((layer) => {
            if (layer.options.id) {
                idsToDelete.push(layer.options.id);
            }
        });

        idsToDelete.forEach((id) => deletePolygon(id));
    };

    const addPolygonsToFeatureGroup = () => {
        const featureGroup = featureGroupRef.current;
        if (!featureGroup) return;

        featureGroup.clearLayers();

        polygons.forEach((polygon) => {
            const leafletPolygon = new L.Polygon(
                polygon.coordinates.map((p) => [p.latitude, p.longitude]),
                { color: polygon.color, fillColor: polygon.color, id: polygon.id }
            );

            leafletPolygon.on("click", () => {
                setZoneSelected(polygon);
            });

            featureGroup.addLayer(leafletPolygon);
        });
    };

    useEffect(() => {
        addPolygonsToFeatureGroup();
    }, [polygons]);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{zoneSelected ? `Modifier la zone ${zoneSelected.name}` : "Aucune zone sélectionnée"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {zoneSelected && (
                        <>
                            <Label htmlFor="zoneName">Nom de la zone</Label>
                            <Input
                                type="text"
                                id="zoneName"
                                value={zoneSelected.name}
                                onChange={(e) =>
                                    setZoneSelected((prev) => ({ ...prev, name: e.target.value }))
                                }
                            />
                            <Label htmlFor="zoneColor">Couleur de la zone</Label>
                            <Input
                                type="color"
                                id="zoneColor"
                                value={zoneSelected.color}
                                onChange={(e) =>
                                    setZoneSelected((prev) => ({ ...prev, color: e.target.value }))
                                }
                            />
                            <Label htmlFor="technicianSelect">Technicien</Label>
                            <Select
                                onValueChange={(value) =>
                                    setZoneSelected((prev) => ({
                                        ...prev,
                                        technician: value === "none" ? null : Number(value),
                                    }))
                                }
                                defaultValue={String(zoneSelected?.technician || "none")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir un technicien">
                                        {zoneSelected.technician?.email}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Aucun technicien</SelectItem>
                                    {technicians.map((tech) => {
                                        const isAssigned = polygons.some(
                                            (polygon) =>
                                                polygon.technician === tech.id &&
                                                polygon.id !== zoneSelected?.id
                                        );

                                        return (
                                            <SelectItem
                                                key={tech.id}
                                                value={String(tech.id)}
                                                disabled={isAssigned}
                                            >
                                                {tech.email} {isAssigned ? "(Assigné)" : ""}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={() => updatePolygon(zoneSelected)}
                                className="btn btn-primary mt-2"
                            >
                                Sauvegarder
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
            <MapContainer
                style={styles.map}
                center={[45.757704, 4.834099]}
                zoom={13}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FeatureGroup ref={featureGroupRef}>
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
            </MapContainer>
        </>
    );
}
