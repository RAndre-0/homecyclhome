<?php

namespace App\DataFixtures;

use Datetime;
use DateInterval;
use App\Entity\User;
use App\Entity\Zone;
use App\Entity\Produit;
use App\Entity\Intervention;
use App\Entity\TypeIntervention;
use App\Entity\InterventionProduit;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private HttpClientInterface $client, UserPasswordHasherInterface $userPasswordHasher) {
            $this->userPasswordHasher = $userPasswordHasher;
    }
    public function load(ObjectManager $manager): void
    {
        $velos_references = [
            "Peugeot" => ["Citystar", "RC500", "RCZ", "E-Legend"],
            "Lapierre" => ["Overvolt", "Aircode", "Xelius"],
            "Look" => ["999 Race", "795 Blade", "695", "E-765"],
            "Btwin" => ["Rockrider 540", "Ultra AF", "Riverside", "Elops"],
            "Cyfac" => ["XCR", "RSL", "Voyageur", "E-Gravel"],
            "Meral" => ["Trail 900", "Speedster", "Urban", "E-City"],
            "Dilecta" => ["Raptor", "Chrono", "Trekking", "E-Trekking"],
            "Van Rysel" => ["MTB 920", "Road Race", "Allroad", "E-Cargo"],
            "Triban" => ["Riverside 500", "RC 520", "City", "E-Cité"],
            "Gir's" => ["Enduro Pro", "Sprint", "Cruiser", "E-MTB"],
            "Victoire" => ["Summit", "Aero", "Classique", "E-Road"],
            "Origine" => ["Trail", "Endurance", "Comfort", "E-Folding"],
            "Heroïn" => ["Dirt Jump", "Fixie", "BMX", "E-BMX"],
            "Stajvelo" => ["Gravel", "Cyclocross", "Tout-terrain", "E-Adventure"]
        ];
        $firstNames = [
            'Antoine', 'Baptiste', 'Cécile', 'Dorian', 'Élise', 'Florian', 'Gabriel', 'Hélène', 'Isabelle', 'Julien',
            'Karine', 'Laurent', 'Mathilde', 'Nicolas', 'Océane', 'Pierre', 'Quentin', 'Raphaël', 'Sophie', 'Thibaut',
            'Ursule', 'Victor', 'Wilfried', 'Xavier', 'Yves', 'Zoé', 'Adrien', 'Brigitte', 'Charlotte', 'Damien',
            'Estelle', 'Fabrice', 'Géraldine', 'Hugo', 'Inès', 'Jean', 'Katell', 'Louise', 'Mélanie', 'Nathaniel',
            'Olivier', 'Pauline', 'Quentin', 'René', 'Séverine', 'Thomas', 'Ulysse', 'Valérie', 'William', 'Xénia'
        ];
        $lastNames = [
            'Dubois', 'Morel', 'Garnier', 'Faure', 'Blanc', 'Dupont', 'Bertrand', 'Lemoine', 'Rousseau', 'Morin',
            'Noël', 'Simon', 'Lemoine', 'Girard', 'Perrin', 'Bonnet', 'Dupuis', 'Benoit', 'Martel', 'Moulin',
            'Lefevre', 'Chevalier', 'Bouvier', 'Roy', 'Vidal', 'Gauthier', 'Barbier', 'Denis', 'Marchand', 'Colin',
            'Perrot', 'Dumas', 'Fontaine', 'Mallet', 'Renard', 'Guérin', 'Lemoine', 'Meunier', 'Clément', 'Dubois',
            'Lambert', 'Hervé', 'Picard', 'Carpentier', 'Petit', 'Tissier', 'Durand', 'Masson', 'Leclerc', 'Renaud'
        ];
        
        // Création des types d'intervention
        $typeInter1 = new TypeIntervention();
        $typeInter1->setNom("Maintenance");
        $typeInter1->setPrixDepart(30);
        $typeInter1->setDuree(new \DateTime('00:30'));
        $manager->persist($typeInter1);
        $typeInter2 = new TypeIntervention();
        $typeInter2->setNom("Réparation");
        $typeInter2->setPrixDepart(45);
        $typeInter2->setDuree(new \DateTime('00:45'));
        $manager->persist($typeInter2);
        $typesIntervention = [$typeInter1, $typeInter2];

        $users =  [];
        // Création des users
        for ($i = 0 ; $i < 10 ; $i++) {
            $user = new User();
            $user->setEmail("user" . $i . "@gmail.com");
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $user->setFirstName($firstName);
            $user->setLastName($lastName);
            $user->setPassword($this->userPasswordHasher->hashPassword($user, "password"));
            $users[] = $user;
            $manager->persist($user);
        }

        $technicians = [];
        // Création des techniciens
        for ($i = 0 ; $i < 5 ; $i++) {
            $userTech = new User();
            $userTech->setEmail("tech" . $i . "@gmail.com");
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $userTech->setFirstName($firstName);
            $userTech->setLastName($lastName);
            $userTech->setRoles(["ROLE_TECHNICIEN"]);
            $userTech->setPassword($this->userPasswordHasher->hashPassword($userTech, "password"));
            $technicians[] = $userTech;
            $manager->persist($userTech);
        }

        // Création d'un user admin
        $userAdmin = new User();
        $userAdmin->setEmail("admin@gmail.com");
        $firstName = $firstNames[array_rand($firstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        $userAdmin->setFirstName($firstName);
        $userAdmin->setLastName($lastName);
        $userAdmin->setRoles(["ROLE_ADMIN"]);
        $userAdmin->setPassword($this->userPasswordHasher->hashPassword($userAdmin, "password"));
        $manager->persist($userAdmin);

        // Charger le fichier JSON
        $zonesFilePath = __DIR__ . '/zones.json';
        $zonesData = json_decode(file_get_contents($zonesFilePath), true);

        foreach ($zonesData as $zoneInfo) {
            $zone = new Zone();
            $zone->setName($zoneInfo['name']);
            $zone->setColour($zoneInfo['colour']);
            $zone->setCoordinates($zoneInfo['coordinates']);

            // Associer un technicien aléatoire
            $zone->setTechnician($technicians[0]);
            array_shift($technicians);

            $manager->persist($zone);
        }

        /* Génération des produits */
        for ($i = 0 ; $i < 30 ; $i++) {
            // Generate produits
            $produit = new Produit();
            $designation = "Designation " . $i;
            $produit->setDesignation($designation);
            $prixProduit = random_int(1, 100) - 0.01;
            $produit->setPrix($prixProduit);
            $description = $this->client->request(
                'GET',
                'https://loripsum.net/api/2/plaintext',
                [
                    "verify_peer" => false,
                ]
            );
            $produit->setDescription($description->getContent());

            // Generate interventions
            $intervention = new Intervention();
            $intervention->setVeloElectrique($i%2);
            $intervention->setVeloCategorie("Catégorie");
            $marque = array_rand($velos_references);
            $modeles = $velos_references[$marque];
            $modeleAleatoire = $modeles[array_rand($modeles)];
            $intervention->setVeloMarque($marque);
            $intervention->setVeloModele($modeleAleatoire);
            $intervention->setAdresse("Adresse " . $i);
            $d = array_rand($typesIntervention);
            $intervention->setTypeIntervention($typesIntervention[random_int(0, 1)]);
            $pile_face = random_int(0, 1);
            if ($pile_face == 1) {
                $intervention->setTechnicien($technicians[random_int(0, count($technicians)-1)]);
                $intervention->setClient($users[random_int(0, count($users)-1)]);
                $now = new \DateTime();
                $currentYear = (int)$now->format('Y');
                $currentMonth = (int)$now->format('m');
                
                // Génération de la date d'intervention
                $month = random_int(1, 12);
                $day = random_int(1, 28); // On limite à 28 pour éviter les problèmes de jours invalides
                $hour = random_int(8, 20);
                // Si le mois généré est inférieur ou égal au mois actuel, on garde l'année en cours, sinon, on passe à l'année suivante.
                $year = $month >= $currentMonth ? $currentYear : $currentYear + 1;
                $intervention->setDebut(new \DateTime("{$year}-{$month}-{$day} {$hour}:30"));

                // Génération InterventionProduit
                $pile_face = random_int(0, 1);
                if ($pile_face == 1) {
                    $interventionProduit = new InterventionProduit();
                    $interventionProduit->setIntervention($intervention);
                    $interventionProduit->setProduit($produit);
                    $quantite = random_int(1, 3);
                    $interventionProduit->setQuantite($quantite);
                    $interventionProduit->setPrix($prixProduit*$quantite);
                    $interventionProduit->setDesignation($designation);
                    $manager->persist($interventionProduit);
                }
            }

            $manager->persist($produit);
            $manager->persist($intervention);
        }

        $manager->flush();
    }
}
