<?php

namespace App\Controller;

use App\Entity\Zone;
use App\Repository\ZoneRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class ZoneController extends AbstractController
{
    /* Renvoie toutes les zones */
    #[Route("/api/zones", name: "get_zones", methods: ["GET"])]
    public function get_zones(ZoneRepository $zoneRepository, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
    {
        $id_cache = "get_zones";

        $listeZones = $cache->get($id_cache, function ($item) use ($zoneRepository, $serializer) {
            $item->tag("zones_cache");
            $listeZones = $zoneRepository->findAll();
            return $serializer->serialize($listeZones, "json", ["groups" => "get_zones"]);
        });

        return new JsonResponse($listeZones, Response::HTTP_OK, [], true);
    }

    /* Créé une nouvelle zone */
    #[Route("/api/zones", name: "create_zone", methods: ["POST"])]
    public function new_zone(
        ZoneRepository $zoneRepository,
        Request $request,
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlGeneratorInterface $urlGenerator,
        ValidatorInterface $validator,
        TagAwareCacheInterface $cache): JsonResponse
    {
        // Désérialisation des données JSON en un objet Zone
        $zone = $serializer->deserialize($request->getContent(), Zone::class, "json");

        // Validation des données
        $errors = $validator->validate($zone);
        if ($errors->count() > 0) {
            return new JsonResponse($serializer->serialize($errors, "json"), JsonResponse::HTTP_BAD_REQUEST, [], true);
        }

        $em->persist($zone);
        $em->flush();

        // Suppression du cache lié aux zones
        $cache->invalidateTags(["zones_cache"]);

        // Génération de l'URL de la ressource créée
        $location = $urlGenerator->generate("get_zone", ["id" => $zone->getId()], UrlGeneratorInterface::ABSOLUTE_URL);

        // Sérialisation de la zone créée pour la réponse
        $zoneJson = $serializer->serialize($zone, "json");

        return new JsonResponse($zoneJson, JsonResponse::HTTP_CREATED, ["location" => $location], true);
    }

    /* Retourne une zone */
    #[Route("/api/zones/{id}", name: "get_zone", methods: ["GET"])]
    public function show_zone(Zone $zone, SerializerInterface $serializer): JsonResponse
    {
        $zoneJson = $serializer->serialize($zone, 'json');
        return new JsonResponse($zoneJson, Response::HTTP_OK, [], true);
    }

    /* Modifie une zone */
    #[Route("/api/zones/{id}/edit", name: "update_zone", methods: ["PUT", "PATCH"])]
    public function edit_zone(Request $request, Zone $zone, EntityManagerInterface $em, ZoneRepository $zoneRepository, UserRepository $userRepository, TagAwareCacheInterface $cache, SerializerInterface $serializer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $zoneModifiee = $serializer->deserialize($request->getContent(), Zone::class, "json", [AbstractNormalizer::OBJECT_TO_POPULATE => $zone]);
        // Gérer la relation avec le technicien
        if (isset($data['technician'])) {
            $technician = $userRepository->find(intval($data['technician']));
            if (!$technician) {
                return new JsonResponse(['message' => 'Technician not found'], Response::HTTP_BAD_REQUEST);
            }
            $zoneModifiee->setTechnician($technician);
        }
        $em->persist($zoneModifiee);
        $em->flush();
        $cache->invalidateTags(["zones_cache"]);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /* Supprime une zone */
    #[Route('/api/zones/{id}', name: 'delete_zone', methods: ["DELETE"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function delete_zone(Zone $zone, EntityManagerInterface $em, TagAwareCacheInterface $cache): JsonResponse
    {
        $em->remove($zone);
        $em->flush();
        $cache->invalidateTags(["zones_cache"]);
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
