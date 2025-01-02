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
    #[Route('/api/new-interventions/{idModel}', name: 'create_interventions_from_modele', methods: ["POST"])]
    #[IsGranted("ROLE_ADMIN", message: "Droits insuffisants.")]
    public function createInterventionsFromModele(
        int $idModel,
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
    
        // Générer les dates entre "from" et "to"
        $interval = new \DateInterval('P1D'); // Intervalle d'un jour
        $dateRange = new \DatePeriod($from, $interval, (clone $to)->modify('+1 day'));
    
        // Créer les interventions
        foreach ($dateRange as $date) {
            foreach ($technicians as $technician) {
                foreach ($modelePlanning->getModeleInterventions() as $modeleIntervention) {
                    $intervention = new Intervention();
                    $intervention->setDebut((clone $date)->setTime(
                        (int)$modeleIntervention->getInterventionTime()->format('H'),
                        (int)$modeleIntervention->getInterventionTime()->format('i'),
                        0
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
