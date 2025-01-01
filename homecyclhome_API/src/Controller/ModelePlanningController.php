<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class ModelePlanningController extends AbstractController
{
    /* Renvoie tous les modeles */
    #[Route('/api/modeles-planning', name: 'get_modeles_planning', methods: ["GET"])]
    public function get_modeles(ModelePlanningRepository $modelePlanningRepository, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
    {
        $id_cache = "modele_planning_cache";
        $cache->invalidateTags(["modele_planning_cache"]);
        $liste_modeles_planning = $cache->get($id_cache, function (ItemInterface $item) use ($modelePlanningRepository, $serializer) {
            $item->tag("modele_planning_cache");
            $liste_modeles_planning = $modelePlanningRepository->findAll();
            return $serializer->serialize($liste_modeles_planning, "json", ["groups" => "get_modelePlannings"]);
        });

        return new JsonResponse($liste_modeles_planning, Response::HTTP_OK, [], true);
    }
}
