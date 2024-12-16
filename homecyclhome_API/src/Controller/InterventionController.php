<?php

namespace App\Controller;

use App\Entity\Intervention;
use App\Repository\InterventionRepository;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;


class InterventionController extends AbstractController
{
    /* Renvoie tous les interventions */
    #[Route('/api/interventions', name: 'interventions', methods: ["GET"])]
    public function get_intervention(InterventionRepository $interventionRepository, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
    {
        $id_cache = "interventions_cache";
        $cache->invalidateTags(["interventions_cache"]);
        $liste_interventions = $cache->get($id_cache, function (ItemInterface $item) use ($interventionRepository, $serializer) {
            $item->tag("interventions_cache");
            $liste_interventions = $interventionRepository->findAll();
            return $serializer->serialize($liste_interventions, "json", ["groups" => "get_interventions"]);
        });

        return new JsonResponse($liste_interventions, Response::HTTP_OK, [], true);
    }
}