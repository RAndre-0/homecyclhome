<?php

namespace App\Controller;

use App\Repository\ModelePlanningRepository;
use App\Repository\UserRepository;
use App\Entity\Intervention;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManagerInterface;
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

    /* Créé des interventions à partir d'un modèle */
    #[Route('/api/new-interventions/{idModel}/{idTechnician?}', name: 'create_interventions_from_modele', methods: ["POST"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function createInterventionsFromModele(
        int $idModel,
        ?int $idTechnician,
        Request $request,
        ModelePlanningRepository $modelePlanningRepository,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Récupérer le modèle de planning
        $modelePlanning = $modelePlanningRepository->find($idModel);
        if (!$modelePlanning) {
            return new JsonResponse(['error' => 'Modèle de planning introuvable.'], 404);
        }
    
        // Récupérer les techniciens concernés
        $technicians = [];
        if ($idTechnician) {
            $technician = $userRepository->find($idTechnician);
            if (!$technician) {
                return new JsonResponse(['error' => 'Technicien introuvable.'], 404);
            }
            $technicians[] = $technician;
        } else {
            $technicians = $userRepository->findUsersByRole('ROLE_TECHNICIEN');
        }
    
        // Récupérer les dates depuis le corps de la requête
        $data = json_decode($request->getContent(), true);
        if (!isset($data['dates']) || !is_array($data['dates'])) {
            return new JsonResponse(['error' => 'Les dates doivent être spécifiées sous forme de tableau.'], 400);
        }
        $dates = array_map(fn($date) => \DateTime::createFromFormat('Y-m-d', $date), $data['dates']);
    
        $timezone = new \DateTimeZone('Europe/Paris');
        
        // Validation des dates
        foreach ($dates as $date) {
            if (!$date) {
                return new JsonResponse(['error' => 'Format de date invalide. Utilisez le format Y-m-d.'], 400);
            }
        }
    
        // Créer des interventions
        foreach ($dates as $date) {
            foreach ($technicians as $technician) {
                foreach ($modelePlanning->getModeleInterventions() as $modeleIntervention) {
                    $intervention = new Intervention();
                    $intervention->setDebut((clone $date)->setTime(
                        (int)$modeleIntervention->getInterventionTime()->format('H'),
                        (int)$modeleIntervention->getInterventionTime()->format('i')
                    ));
                    $intervention->setTypeIntervention($modeleIntervention->getTypeIntervention());
                    $intervention->setTechnicien($technician);
                    $entityManager->persist($intervention);
                }
            }
        }
    
        // Sauvegarde en base de données
        $entityManager->flush();
    
        return new JsonResponse(['success' => 'Interventions créées avec succès.'], 201);
    }
}
