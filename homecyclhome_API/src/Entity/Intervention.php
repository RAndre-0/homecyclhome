<?php

namespace App\Entity;

use App\Repository\InterventionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: InterventionRepository::class)]
class Intervention
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["get_produit", "get_interventions", "get_intervention"])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["get_interventions", "get_intervention"])]
    private ?string $velo_categorie = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["get_interventions", "get_intervention"])]
    private ?bool $velo_electrique = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["get_interventions", "get_intervention"])]
    private ?string $velo_marque = null;

    #[ORM\Column(length: 255)]
    #[Groups(["get_interventions", "get_intervention"])]
    private ?string $velo_modele = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["get_interventions", "get_intervention"])]
    private ?string $adresse = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(["get_interventions", "get_intervention"])]
    private ?string $commentaire_client = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["get_interventions", "get_intervention"])]
    private ?string $photo = null;

    /**
     * @var Collection<int, InterventionProduit>
     */
    #[ORM\OneToMany(targetEntity: InterventionProduit::class, mappedBy: 'intervention')]
    #[Groups(["get_intervention"])]
    private Collection $interventionProduit;

    #[ORM\ManyToOne(inversedBy: 'interventions')]
    private ?TypeIntervention $type_intervention = null;

    #[ORM\ManyToOne(inversedBy: 'demandes_intervention')]
    private ?User $client = null;

    #[ORM\ManyToOne(inversedBy: 'interventions')]
    private ?User $technicien = null;

    /**
     * @var Collection<int, CommentaireIntervention>
     */
    #[ORM\OneToMany(targetEntity: CommentaireIntervention::class, mappedBy: 'intervention')]
    private Collection $commentaires;

    public function __construct()
    {
        $this->interventionProduit = new ArrayCollection();
        $this->commentaires = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getVeloCategorie(): ?string
    {
        return $this->velo_categorie;
    }

    public function setVeloCategorie(?string $velo_categorie): static
    {
        $this->velo_categorie = $velo_categorie;

        return $this;
    }

    public function isVeloElectrique(): ?bool
    {
        return $this->velo_electrique;
    }

    public function setVeloElectrique(?bool $velo_electrique): static
    {
        $this->velo_electrique = $velo_electrique;

        return $this;
    }

    public function getVeloMarque(): ?string
    {
        return $this->velo_marque;
    }

    public function setVeloMarque(?string $velo_marque): static
    {
        $this->velo_marque = $velo_marque;

        return $this;
    }

    public function getVeloModele(): ?string
    {
        return $this->velo_modele;
    }

    public function setVeloModele(string $velo_modele): static
    {
        $this->velo_modele = $velo_modele;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getCommentaireClient(): ?string
    {
        return $this->commentaire_client;
    }

    public function setCommentaireClient(?string $commentaire_client): static
    {
        $this->commentaire_client = $commentaire_client;

        return $this;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): static
    {
        $this->photo = $photo;

        return $this;
    }

    /**
     * @return Collection<int, InterventionProduit>
     */
    public function getInterventionProduit(): Collection
    {
        return $this->interventionProduit;
    }

    public function addInterventionProduit(InterventionProduit $interventionProduit): static
    {
        if (!$this->interventionProduit->contains($interventionProduit)) {
            $this->interventionProduit->add($interventionProduit);
            $interventionProduit->setIntervention($this);
        }

        return $this;
    }

    public function removeInterventionProduit(InterventionProduit $interventionProduit): static
    {
        if ($this->interventionProduit->removeElement($interventionProduit)) {
            // set the owning side to null (unless already changed)
            if ($interventionProduit->getIntervention() === $this) {
                $interventionProduit->setIntervention(null);
            }
        }

        return $this;
    }

    public function getTypeIntervention(): ?TypeIntervention
    {
        return $this->type_intervention;
    }

    public function setTypeIntervention(?TypeIntervention $type_intervention): static
    {
        $this->type_intervention = $type_intervention;

        return $this;
    }

    public function getClient(): ?User
    {
        return $this->client;
    }

    public function setClient(?User $client): static
    {
        $this->client = $client;

        return $this;
    }

    public function getTechnicien(): ?User
    {
        return $this->technicien;
    }

    public function setTechnicien(?User $technicien): static
    {
        $this->technicien = $technicien;

        return $this;
    }

    /**
     * @return Collection<int, CommentaireIntervention>
     */
    public function getCommentaires(): Collection
    {
        return $this->commentaires;
    }

    public function addCommentaire(CommentaireIntervention $commentaire): static
    {
        if (!$this->commentaires->contains($commentaire)) {
            $this->commentaires->add($commentaire);
            $commentaire->setIntervention($this);
        }

        return $this;
    }

    public function removeCommentaire(CommentaireIntervention $commentaire): static
    {
        if ($this->commentaires->removeElement($commentaire)) {
            // set the owning side to null (unless already changed)
            if ($commentaire->getIntervention() === $this) {
                $commentaire->setIntervention(null);
            }
        }

        return $this;
    }
}
