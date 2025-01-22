<?php

namespace App\Entity;

use App\Repository\ZoneRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ZoneRepository::class)]
class Zone
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["get_zones"])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(["get_zones"])]
    private ?string $name = null;

    #[ORM\Column(length: 7, nullable: true)]
    #[Assert\Regex(
        pattern: '/^#[0-9A-Fa-f]{6}$/',
        message: 'Le code couleur doit être un code hexadécimal valide, par exemple #FFFFFF.'
    )]
    #[Groups(["get_zones"])]
    private ?string $color = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["get_zones"])]
    private ?array $coordinates = null;

    #[ORM\OneToOne(inversedBy: 'zone', cascade: ['persist', 'remove'])]
    #[Groups(["get_zones"])]
    private ?User $technicien = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color): static
    {
        $this->color = $color;

        return $this;
    }

    public function getCoordinates(): ?array
    {
        return $this->coordinates;
    }

    public function setCoordinates(?array $coordinates): static
    {
        $this->coordinates = $coordinates;

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
}
