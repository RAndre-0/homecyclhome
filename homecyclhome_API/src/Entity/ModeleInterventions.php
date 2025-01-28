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
    private ?\DateTimeInterface $interventiontime = null;

    #[ORM\ManyToOne(inversedBy: 'modeleInterventions')]
    private ?TypeIntervention $typeIntervention = null;

    #[ORM\ManyToOne(inversedBy: 'modeleInterventions')]
    private ?ModelePlanning $modeleIntervention = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getInterventionTime(): ?\DateTimeInterface
    {
        return $this->interventiontime;
    }

    public function setInterventionTime(\DateTimeInterface $interventiontime): static
    {
        $this->interventiontime = $interventiontime;

        return $this;
    }

    public function getTypeIntervention(): ?TypeIntervention
    {
        return $this->typeIntervention;
    }

    public function setTypeIntervention(?TypeIntervention $typeIntervention): static
    {
        $this->typeIntervention = $typeIntervention;

        return $this;
    }

    public function getModeleIntervention(): ?ModelePlanning
    {
        return $this->modeleIntervention;
    }

    public function setModeleIntervention(?ModelePlanning $modeleIntervention): static
    {
        $this->modeleIntervention = $modeleIntervention;

        return $this;
    }
}
