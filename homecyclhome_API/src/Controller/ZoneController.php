<?php

namespace App\Controller;

use App\Entity\Zone;
use App\Repository\ZoneRepository;
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

final class ZoneController extends AbstractController
{
    /* Renvoie toutes les zones */
    #[Route("/api/zones", name: "zones", methods: ["GET"])]
    public function get_zones(ZoneRepository $zoneRepository, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
    {
        $id_cache = "get_zones";
        $cache->invalidateTags(["zones_cache"]);

        $liste_zones = $cache->get($id_cache, function ($item) use ($zoneRepository, $serializer) {
            $item->tag("zones_cache");
            $liste_zones = $zoneRepository->findAll();
            return $serializer->serialize($liste_zones, "json", ["groups" => "get_zones"]);
        });

        return new JsonResponse($liste_zones, Response::HTTP_OK, [], true);
    }

    /* Créé une nouvelle zone */
    #[Route("/api/zones", name: "create_zone", methods: ["POST"])]
    public function new(
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
        $json_zone = $serializer->serialize($zone, "json");

        return new JsonResponse($json_zone, JsonResponse::HTTP_CREATED, ["location" => $location], true);
    }

    /* Retourne une zone */
    #[Route("/api/{id}", name: "get_zone", methods: ["GET"])]
    public function show(Zone $zone, ZoneRepository $zoneRepository, Request $request): JsonResponse
    {
        $zone_json = $serializer->serialize($zone, 'json');
        return new JsonResponse($zone_json, Response::HTTP_OK, [], true);
    }

    #[Route("/api/{id}/edit", name: "edit_zone", methods: ["GET", "POST"])]
    public function edit(Request $request, Zone $zone, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(ZoneType::class, $zone);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();
            $cache->invalidateTags(["zones_cache"]);
            return $this->redirectToRoute("app_zone_index", [], Response::HTTP_SEE_OTHER);
        }

        return $this->render("zone/edit.html.twig", [
            "zone" => $zone,
            "form" => $form,
        ]);
    }

    /* Supprime une zone */
    #[Route('/api/zones/{id}', name: 'delete_zone', methods: ["DELETE"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function delete_user(Zone $zone, EntityManagerInterface $em, TagAwareCacheInterface $cache): JsonResponse
    {
        $em->remove($zone);
        $em->flush();
        $cache->invalidateTags(["zones_cache"]);
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
