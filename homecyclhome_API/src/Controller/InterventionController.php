<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Entity\Intervention;
use App\Repository\InterventionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;


class InterventionController extends AbstractController
{
    /* Renvoie tous les interventions */
    #[Route('/api/interventions', name: 'get_interventions', methods: ["GET"])]
    public function get_interventions(InterventionRepository $interventionRepository, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
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
    
    /* Renvoie les interventions d'un technicien */
    #[Route('/api/interventions/technicien/{id}', name: 'get_interventions_technicien', methods: ["GET"])]
    public function get_interventions_by_technicien(
        int $id,
        Request $request,
        InterventionRepository $interventionRepository,
        SerializerInterface $serializer
    ): JsonResponse {
        // Récupération du paramètre reservedOnly
        $reservedOnly = filter_var($request->query->get('reservedOnly', false), FILTER_VALIDATE_BOOLEAN);
    
        $interventions = $interventionRepository->findByTechnicienWithFilter($id, $reservedOnly);
    
        $interventions_json = $serializer->serialize($interventions, 'json', ['groups' => 'get_interventions']);
        return new JsonResponse($interventions_json, Response::HTTP_OK, [], true);
    }

    /* Renvoie les interventions d'un client */
    #[Route('/api/interventions/client/{id}', name: 'get_interventions_client', methods: ["GET"])]
    public function get_interventions_by_client(
        int $id,
        InterventionRepository $interventionRepository,
        SerializerInterface $serializer
    ): JsonResponse {
        $interventions = $interventionRepository->findBy(['client' => $id]);

        if (!$interventions) {
            return new JsonResponse([], Response::HTTP_NOT_FOUND);
        }

        $interventions_json = $serializer->serialize($interventions, 'json', ['groups' => 'get_interventions']);
        return new JsonResponse($interventions_json, Response::HTTP_OK, [], true);
    }

    /* Retourne une intervention */
    #[Route('/api/interventions/{id}', name: 'get_intervention', methods: ["GET"])]
    public function get_intervention(Intervention $intervention, SerializerInterface $serializer): JsonResponse
    {
        $intervention_json = $serializer->serialize($intervention, "json", ["groups" => "get_intervention"]);
        return new JsonResponse($intervention_json, Response::HTTP_OK, [], true);
    }

    /* Créé une nouvelle intervention */
    #[Route("/api/interventions", name: "create_intervention", methods: ["POST"])]
    public function new_intervention(
        Request $request,
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlGeneratorInterface $urlGenerator,
        ValidatorInterface $validator,
        TagAwareCacheInterface $cache
    ): JsonResponse {
        // Désérialisation des données JSON en un objet intervention
        $intervention = $serializer->deserialize($request->getContent(), Intervention::class, "json");

        // Validation des données
        $errors = $validator->validate($intervention);
        if ($errors->count() > 0) {
            return new JsonResponse($serializer->serialize($errors, "json"), JsonResponse::HTTP_BAD_REQUEST, [], true);
        }

        $em->persist($intervention);
        $em->flush();

        // Suppression du cache lié aux interventions
        $cache->invalidateTags(["interventions_cache"]);

        // Génération de l'URL de la ressource créée
        $location = $urlGenerator->generate("get_intervention", ["id" => $intervention->getId()], UrlGeneratorInterface::ABSOLUTE_URL);

        // Sérialisation de la intervention créée pour la réponse
        $json_intervention = $serializer->serialize($intervention, "json");

        return new JsonResponse($json_intervention, JsonResponse::HTTP_CREATED, ["location" => $location], true);
    }

    /* Modifie une intervention */
    #[Route("/api/interventions/{id}/edit", name: "update_intervention", methods: ["PUT", "PATCH"])]
    public function edit_intervention(Request $request, Intervention $intervention, EntityManagerInterface $em, TagAwareCacheInterface $cache, SerializerInterface $serializer): JsonResponse
    {
        $intervention_modifiee = $serializer->deserialize($request->getContent(), Intervention::class, "json", [AbstractNormalizer::OBJECT_TO_POPULATE => $intervention]);
        $em->persist($intervention_modifiee);
        $em->flush();
        $cache->invalidateTags(["interventions_cache"]);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /* Supprime les interventions dans une plage de dates pour les techniciens listés */
    #[Route('/api/interventions/delete', name: 'delete_interventions', methods: ["DELETE"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function deleteInterventions(
        Request $request,
        UserRepository $userRepository,
        InterventionRepository $interventionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
    
        // Valider les techniciens
        if (!isset($data['technicians']) || !is_array($data['technicians'])) {
            return new JsonResponse(['error' => 'Les techniciens doivent être spécifiés sous forme de tableau d\'identifiants.'], 400);
        }
    
        $technicians = [];
        foreach ($data['technicians'] as $technicianId) {
            $technician = $userRepository->find($technicianId);
            if (!$technician) {
                return new JsonResponse(['error' => "Technicien introuvable avec l'identifiant $technicianId."], 404);
            }
            $technicians[] = $technician;
        }
    
        // Valider les dates "from" et "to"
        if (!isset($data['from'], $data['to'])) {
            return new JsonResponse(['error' => 'Les paramètres "from" et "to" doivent être spécifiés.'], 400);
        }
    
        $from = \DateTime::createFromFormat('Y-m-d', $data['from']);
        $to = \DateTime::createFromFormat('Y-m-d', $data['to']);
    
        if (!$from || !$to || $from > $to) {
            return new JsonResponse(['error' => 'Les dates "from" et "to" doivent être valides et "from" ne peut pas être après "to".'], 400);
        }
    
        // Supprimer les interventions pour chaque technicien dans la plage de dates
        foreach ($technicians as $technician) {
            $interventions = $interventionRepository->findNonReservedInterventionsByTechnicianAndDateRange(
                $technician,
                $from,
                $to
            );
    
            foreach ($interventions as $intervention) {
                $entityManager->remove($intervention);
            }
        }
    
        // Sauvegarde des modifications
        $entityManager->flush();
    
        return new JsonResponse(['success' => 'Interventions supprimées avec succès.'], 200);
    }
    

    /* Supprime une intervention */
    #[Route('/api/interventions/{id}', name: 'delete_intervention', methods: ["DELETE"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function delete_user(Intervention $intervention, EntityManagerInterface $em, TagAwareCacheInterface $cache): JsonResponse
    {
        $em->remove($intervention);
        $em->flush();
        $cache->invalidateTags(["interventions_cache"]);
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
