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
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
    const [zoneSelected, setZoneSelected] = useState(null);

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
    }, []);

    const savePolygon = async (polygon) => {
        try {
            const response = await apiService("zones", "POST", polygon);
            console.log("Zone sauvegardée :", response);
            setPolygons(prevPolygons => [...prevPolygons, { ...polygon, id: response.id }]);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la zone :", error);
        }
    };

    const updatePolygon = async (polygon) => {
        try {
            await apiService(`zones/${polygon.id}`, "PUT", polygon);
            console.log(`Zone ${polygon.id} mise à jour.`);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la zone ${polygon.id} :`, error);
        }
    };

    const deletePolygon = async (id) => {
        try {
            await apiService(`zones/${id}`, "DELETE");
            console.log(`Zone ${id} supprimée.`);
        } catch (error) {
            console.error(`Erreur lors de la suppression de la zone ${id} :`, error);
        }
    };

    const _onCreate = (e) => {
        const newPolygon = e.layer.toGeoJSON();
        const coordinates = newPolygon.geometry.coordinates[0];

        const payload = {
            name: "Nom par défaut",
            colour: "#FF5733",
            coordinates: coordinates.map(coord => ({ longitude: coord[0], latitude: coord[1] })),
            technician: null,
        };

        savePolygon(payload);
    };

    const _onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const updatedPolygon = layer.toGeoJSON();
            const id = layer.options.id; // Ajouter l'ID en option sur chaque layer
            const coordinates = updatedPolygon.geometry.coordinates[0];

            const payload = {
                id,
                name: "Nom modifié", // Vous pouvez récupérer et modifier cela si nécessaire
                colour: "#FF5733", // Ajoutez des champs spécifiques au besoin
                coordinates: coordinates.map(coord => ({ longitude: coord[0], latitude: coord[1] })),
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

        setPolygons((prevPolygons) =>
            prevPolygons.filter((polygon) => !idsToDelete.includes(polygon.id))
        );
    };

    const addPolygonsToFeatureGroup = () => {
        const featureGroup = featureGroupRef.current;
        if (!featureGroup) return;

        featureGroup.clearLayers(); // Efface les couches existantes avant d'ajouter

        polygons.forEach((polygon) => {
            const leafletPolygon = new L.Polygon(
                polygon.coordinates.map((p) => [p.latitude, p.longitude]),
                { color: polygon.colour, fillColor: polygon.colour, id: polygon.id }
            );

            leafletPolygon.on("click", () => {
                setZoneSelected(polygon.id);
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
                    <CardTitle>Zone</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="zoneName">Nom de la zone</Label>
                    <Input type="text" id="zoneName" placeholder="Nom de la zone" />
                    <Label htmlFor="userSelect">Technicien</Label>
                    <Select id="userSelect">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </Card>
            <MapContainer style={styles.map} center={[45.757704, 4.834099]} zoom={13} scrollWheelZoom={false}>
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
