<?php

namespace App\Entity;

use App\Repository\ModeleInterventionsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ModeleInterventionsRepository::class)]
class ModeleInterventions
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTimeInterface $intervention_time = null;

    #[ORM\ManyToOne(inversedBy: 'modeleInterventions')]
    private ?TypeIntervention $type_intervention = null;

    #[ORM\ManyToOne(inversedBy: 'modeleInterventions')]
    private ?ModelePlanning $modele_intervention = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getInterventionTime(): ?\DateTimeInterface
    {
        return $this->intervention_time;
    }

    public function setInterventionTime(\DateTimeInterface $intervention_time): static
    {
        $this->intervention_time = $intervention_time;

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

    public function getModeleIntervention(): ?ModelePlanning
    {
        return $this->modele_intervention;
    }

    public function setModeleIntervention(?ModelePlanning $modele_intervention): static
    {
        $this->modele_intervention = $modele_intervention;

        return $this;
    }
}
