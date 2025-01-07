"use client";
import { apiService } from "@/services/api-service";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function EditUser({ params }) {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    roles: [],
  });
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const fetchedUser = await apiService(`users/${id}`, "GET");
        setUser(fetchedUser);
        setFormData({
          email: fetchedUser.email || "",
          first_name: fetchedUser.first_name || "",
          last_name: fetchedUser.last_name || "",
          roles: fetchedUser.roles || [],
        });
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRolesChange = (value) => {
    setFormData({ ...formData, roles: [value] }); // Assume a single role selection for now
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService(`users/${id}`, "PUT", formData);
      toast({
        title: "Utilisateur modifié avec succès",
        description: "Les informations de l'utilisateur ont été mises à jour.",
        variant: "default",
      });
      router.push("/dashboard/utilisateurs");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
        variant: "destructive",
      });
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Utilisateur non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center">
      <div className="max-w-md w-full p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4">Modifier l'utilisateur</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first_name">Prénom</Label>
            <Input
              id="first_name"
              name="first_name"
              placeholder="Prénom"
              value={formData.first_name}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last_name">Nom</Label>
            <Input
              id="last_name"
              name="last_name"
              placeholder="Nom"
              value={formData.last_name}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@exemple.com"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Rôle</Label>
            <Select
              onValueChange={handleRolesChange}
              defaultValue={formData.roles[0] || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROLE_TECHNICIEN">Technicien</SelectItem>
                <SelectItem value="ROLE_ADMIN">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <span className="loader" /> : "Confirmer"}
          </Button>
        </form>
      </div>
    </div>
  );
}
