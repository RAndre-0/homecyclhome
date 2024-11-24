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
    private ?string $colour = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["get_zones"])]
    private ?array $coordinates = null;

    #[ORM\OneToOne(inversedBy: 'zone', cascade: ['persist', 'remove'])]
    #[Groups(["get_zones"])]
    private ?User $technician = null;

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

    public function getColour(): ?string
    {
        return $this->colour;
    }

    public function setColour(?string $colour): static
    {
        $this->colour = $colour;

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

    public function getTechnician(): ?User
    {
        return $this->technician;
    }

    public function setTechnician(?User $technician): static
    {
        $this->technician = $technician;

        return $this;
    }
}
