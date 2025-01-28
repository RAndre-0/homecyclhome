<?php

namespace App\Controller;

use App\Entity\TypeIntervention;
use Symfony\Contracts\Cache\ItemInterface;
use App\Repository\TypeInterventionRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class TypeInterventionController extends AbstractController
{
    /* Retourne la liste des types d'intervention' */
    #[Route('/api/types-intervention', name: 'get_types_intervention', methods: ["GET"])]
    public function get_types_intervention(TypeInterventionRepository $typeInterventionRepository, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
    {
        $id_cache = "types_inter_cache";
        $cache->invalidateTags([$id_cache]);

        $list_types_intervention = $cache->get($id_cache, function (ItemInterface $item) use ($typeInterventionRepository, $serializer) {
            $item->tag("types_inter_cache");
            $list_types_intervention = $typeInterventionRepository->findAll();
            return $serializer->serialize($list_types_intervention, "json", ["groups" => "get_types_intervention"]);
        });

        return new JsonResponse($list_types_intervention, Response::HTTP_OK, [], true);
    }

    /* Retourne un type d'intervention */
    #[Route('/api/types-intervention/{id}', name: 'get_type_intervention', methods: ["GET"])]
    public function get_type_intervention(TypeIntervention $typeIntervention, SerializerInterface $serializer): JsonResponse
    {
        $typeInterventionJson = $serializer->serialize($typeIntervention, "json", ["groups" => "get_type_Intervention"]);
        return new JsonResponse($typeInterventionJson, Response::HTTP_OK, [], true);
    }
}
