"use client";
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { Polygon, Coordinate, Technicien } from '@/types/types';
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { useState, useEffect, useRef } from 'react';
import { apiService } from "@/services/api-service";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TechnicienSelector from './TechnicienSelector';
import { useToast } from "@/hooks/use-toast";

const styles = {
    map: {
        width: "100%",
        height: "80vh",
        overflow: "hidden",
        zIndex: "0",
    },
};

interface ExtendedPolylineOptions extends L.PolylineOptions {
    id?: number;
}

export default function Map() {
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [zoneSelected, setZoneSelected] = useState<Polygon | null>(null);
    const [techniciens, setTechniciens] = useState<Technicien[]>([]);
    const deletingIds = useRef(new Set<number>());
    const { toast } = useToast();

    const featureGroupRef = useRef<L.FeatureGroup | null>(null);

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

        const fetchTechniciens = async () => {
            try {
                const fetchedTechniciens = await apiService("users/ROLE_TECHNICIEN", "GET");
                setTechniciens(fetchedTechniciens);
            } catch (error) {
                console.error("Error fetching techniciens", error);
            }
        };
        fetchTechniciens();
    }, []);

    // Gestion de la création d'une zone
    const savePolygon = async (polygon: Polygon) => {
        try {
            const response = await apiService("zones", "POST", polygon);
            setPolygons((prevPolygons) => [...prevPolygons, { ...polygon, id: response.id }]);
            toast({ title: "Succès", description: "Zone créée avec succès." });
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la zone :", error);
            toast({ title: "Erreur", description: "Échec de la création de la zone." });
        }
    };
    const _onCreate = (e: any) => {
        const newPolygon = e.layer.toGeoJSON();
        const coordinates = newPolygon.geometry.coordinates[0];

        const payload: Polygon = {
            id: 0,
            name: `Zone${Math.floor(Math.random() * 1000000000)}`,
            color: "#FF5733",
            coordinates: coordinates.map((coord: [number, number]) => ({ longitude: coord[0], latitude: coord[1] })),
            technicien: null,
        };

        savePolygon(payload);
    };

    // Gestion de la modification des zones
    const updatePolygon = async (polygon: Polygon) => {
        try {
            console.log("Updating polygon:", polygon);
            await apiService(`zones/${polygon.id}/edit`, "PUT", {
                ...polygon,
                technicien: polygon.technicien ? polygon.technicien.id : null,
            });
            setPolygons((prevPolygons) =>
                prevPolygons.map((p) => (p.id === polygon.id ? polygon : p))
            );
            toast({ title: "Succès", description: "Zone modifiée avec succès." });
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la zone ${polygon.id} :`, error);
            toast({ title: "Erreur", description: "Échec de la modification de la zone." });
        }
    };
    const _onEditPath = (e: any) => {
        console.log("L'événement _onEditPath a été déclenché", e);
        e.layers.eachLayer((layer: any) => {
            const layerId = layer.options.id;
            if (!layerId) return;
    
            const updatedCoordinates = layer.toGeoJSON().geometry.coordinates[0].map(
                (coord: [number, number]) => ({
                    longitude: coord[0],
                    latitude: coord[1],
                })
            );
    
            const updatedPolygon = polygons.find((p) => p.id === layerId);
            if (!updatedPolygon) return;
    
            const newPolygonData = { ...updatedPolygon, coordinates: updatedCoordinates };
    
            updatePolygon(newPolygonData);
        });
    };
    
    // Gestion de la suppression des zones
    const deletePolygon = async (id: number) => {
        if (deletingIds.current.has(id)) {
            console.warn(`Suppression déjà en cours pour la zone ${id}`);
            return;
        }
    
        deletingIds.current.add(id);
        console.log(`Tentative de suppression de la zone avec l'ID : ${id}`);
        
        try {
            await apiService(`zones/${id}`, "DELETE");
            setPolygons((prevPolygons) => prevPolygons.filter((polygon) => polygon.id !== id));
            toast({ title: "Succès", description: "Suppression réussie." });
        } catch (error) {
            console.error(`Erreur lors de la suppression de la zone ${id} :`, error);
            toast({ title: "Erreur", description: "Échec de la suppression." });
        } finally {
            deletingIds.current.delete(id);
        }
    };
    const _onDeleted = (e: any) => {
        console.log(`Suppression détectée pour ${e.layers.getLayers().length} éléments`);
    
        e.layers.eachLayer((layer: any) => {
            const layerId = layer.options.id;
            if (layerId) {
                deletePolygon(layerId);
            }
        });
    };

    const addPolygonsToFeatureGroup = () => {
        const featureGroup = featureGroupRef.current;
        if (!featureGroup) return;

        featureGroup.clearLayers();
        polygons.forEach((polygon) => {
            if (!polygon.coordinates) {
                console.warn(`Les coordonnées sont indéfinies pour le polygon avec l'ID ${polygon.id}`);
                return;
            }
            const leafletPolygon = new L.Polygon(
                polygon.coordinates.map((p) => [p.latitude, p.longitude]),
                { color: polygon.color, fillColor: polygon.color, id: polygon.id } as ExtendedPolylineOptions
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
                                    setZoneSelected((prev) => ({ ...prev!, name: e.target.value }))
                                }
                            />
                            <Label htmlFor="zoneColor">Couleur de la zone</Label>
                            <Input
                                type="color"
                                id="zoneColor"
                                value={zoneSelected.color}
                                onChange={(e) =>
                                    setZoneSelected((prev) => ({ ...prev!, color: e.target.value }))
                                }
                            />
                            <Label htmlFor="technicienSelect">Technicien</Label>
                            <TechnicienSelector
                                techniciens={techniciens}
                                defaultTechnicien={
                                    techniciens.find((t) => t.id === zoneSelected?.technicien?.id) || null
                                }
                                onTechnicienChange={(selectedTechnicien) =>
                                    setZoneSelected((prev) => ({
                                        ...prev!,
                                        technicien: selectedTechnicien,
                                    }))
                                }
                            />

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
                className="rounded-xl"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topright"
                        onCreated={_onCreate}
                        onDeleted={_onDeleted}
                        onEdited={_onEditPath}
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
