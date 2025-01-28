<?php

namespace App\Controller;

use App\Repository\ModelePlanningRepository;
use App\Repository\UserRepository;
use App\Entity\Intervention;
use App\Entity\ModelePlanning;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ModelePlanningController extends AbstractController
{
    /* Renvoie tous les modeles */
    #[Route('/api/modeles-planning', name: 'get_modeles_planning', methods: ["GET"])]
    public function get_modeles(ModelePlanningRepository $modelePlanningRepository, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
    {
        $idCache = "modele_planning_cache";
        $cache->invalidateTags(["modele_planning_cache"]);
        $listeModelesPlanning = $cache->get($idCache, function (ItemInterface $item) use ($modelePlanningRepository, $serializer) {
            $item->tag("modele_planning_cache");
            $listeModelesPlanning = $modelePlanningRepository->findAll();
            return $serializer->serialize($listeModelesPlanning, "json", ["groups" => "get_modeles_planning"]);
        });

        return new JsonResponse($listeModelesPlanning, Response::HTTP_OK, [], true);
    }

    /* Renvoie un modèle de planning */
    #[Route('/api/modeles-planning/{id}', name: 'get_modele_planning', methods: ["GET"])]
    public function get_modele(ModelePlanning $modelePlanning, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
    {
        $modelePlanningJson = $serializer->serialize($modelePlanning, "json", ["groups" => "get_modele_planning"]);
        return new JsonResponse($modelePlanningJson, Response::HTTP_OK, [], true);
    }

    /* Supprime un modèle de planning et les types d'intervention liés */
    #[Route('/api/modeles-planning/{id}', name: 'delete_modele_planning', methods: ["DELETE"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function delete_modele(
        ModelePlanning $modelePlanning,
        TagAwareCacheInterface $cache,
        EntityManagerInterface $em
    ): JsonResponse {
        $interventionsModele = $modelePlanning->getModeleInterventions();
        foreach ($interventionsModele as $intervention) {
            $em->remove($intervention);
        }
        $em->remove($modelePlanning);
        $em->flush();
        $cache->invalidateTags(["modele_planning_cache"]);
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /* Modifie un modèle */


    /* Créé un nouveau modèle de planning */
    #[Route("/api/modeles-planning", name: "create_modele_planning", methods: ["POST"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function create_modele(
        EntityManagerInterface $em
    ): JsonResponse {
        return new JsonResponse("created", Response::HTTP_OK);
    }

}
