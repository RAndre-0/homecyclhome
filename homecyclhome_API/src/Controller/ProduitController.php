<?php

namespace App\Controller;

use App\Entity\Produit;
use App\Repository\ProduitRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ProduitController extends AbstractController
{
    /* Renvoie tous les produits */
    #[Route('/api/produits', name: 'produits', methods: ["GET"])]
    public function get_produits(ProduitRepository $produitRepository, SerializerInterface $serializer, TagAwareCacheInterface $cache): JsonResponse
    {
        $id_cache = "get_produits";

        $liste_produits = $cache->get($id_cache, function (ItemInterface $item) use ($produitRepository, $serializer) {
            $item->tag("produits_cache");
            $liste_produits = $produitRepository->findAll();
            return $serializer->serialize($liste_produits, "json", ["groups" => "get_produits"]);
        });

        return new JsonResponse($liste_produits, Response::HTTP_OK, [], true);
    }

    /* Retourne un produit */
    #[Route('/api/produits/{id}', name: 'produit', methods: ["GET"])]
    public function get_produit(Produit $produit, ProduitRepository $produitRepository, SerializerInterface $serializer): JsonResponse
    {
        $produit_json = $serializer->serialize($produit, 'json', ["groups" => "get_produit"]);
        return new JsonResponse($produit_json, Response::HTTP_OK, [], true);
    }

    /* Supprime un produit */
    #[Route('/api/produits/{id}', name: 'delete_produit', methods: ["DELETE"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function delete_produit(Produit $produit, EntityManagerInterface $em, TagAwareCacheInterface $cache): JsonResponse
    {
        $cache->invalidateTags(["produits_cache"]);
        $em->remove($produit);
        $em->flush();
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /* Créé un nouveau produit */
    #[Route('/api/produits', name: 'create_produit', methods: ["POST"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function create_produit(Request $request, EntityManagerInterface $em, SerializerInterface $serializer, UrlGeneratorInterface $urlGenerator, ValidatorInterface $validator): JsonResponse
    {
        $produit = $serializer->deserialize($request->getContent(), Produit::class, "json");

        $errors = $validator->validate($produit);
        if ($errors->count() > 0) {
            return new JsonResponse($serializer->serialize($errors, "json"), JsonResponse::HTTP_BAD_REQUEST, [], true);
        }

        $em->persist($produit);
        $em->flush();
        $json_produit = $serializer->serialize($produit, "json", ["groups" => "get_produits"]);
        $location = $urlGenerator->generate("produit", ["id" => $produit->getId()], UrlGeneratorInterface::ABSOLUTE_URL);
        return new JsonResponse($json_produit, Response::HTTP_CREATED, ["location" => $location], true);
    }

    /* Écrase un produit existant */
    #[Route('/api/produits/{id}', name: 'update_produit', methods: ["PUT"])]
    public function update_produit(Produit $produit, EntityManagerInterface $em, SerializerInterface $serializer, ProduitRepository $produitRepository, Request $request): JsonResponse
    {
        $produit_modifie = $serializer->deserialize($request->getContent(), Produit::class, "json", [AbstractNormalizer::OBJECT_TO_POPULATE => $produit]);
        $em->persist($produit_modifie);
        $em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
