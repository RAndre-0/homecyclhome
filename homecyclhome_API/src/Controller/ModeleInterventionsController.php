<?php

namespace App\Controller;

use App\Entity\ModeleInterventions;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\ModeleInterventionsRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ModeleInterventionsController extends AbstractController
{
    /* Renvoie les relations modèle interventions */
    #[Route('/api/modele-interventions', name: 'get_modele_interventions')]
    public function index(ModeleInterventionsRepository $modeleInterventionsRepository, TagAwareCacheInterface $cache, SerializerInterface $serializer): JsonResponse
    {
        $idCache = "modele_interventions_cache";
        $cache->invalidateTags(["modele_interventions_cache"]);
        $listModeleInterventions = $cache->get($idCache, function (ItemInterface $item) use ($modeleInterventionsRepository, $serializer) {
            $item->tag("modele_interventions_cache");
            $listModeleInterventions = $modeleInterventionsRepository->findAll();
            return $serializer->serialize($listModeleInterventions, "json", ["groups" => "get_modele_interventions"]);
        });

        return new JsonResponse($listModeleInterventions, Response::HTTP_OK, [], true);
    }

    /* Retourne un type d'intervention du modèle */
    #[Route('/api/modele-interventions/{id}', name: "get_modele_intervention", methods: ["GET"])]
    public function get_intervention(ModeleInterventions $modeleInterventions, SerializerInterface $serializer): JsonResponse
    {
        $modeleInterventionsJson = $serializer->serialize($modeleInterventions, "json", ["groups" => "get_modele_intervention"]);
        return new JsonResponse($modeleInterventionsJson, Response::HTTP_OK, [], true);
    }
}
