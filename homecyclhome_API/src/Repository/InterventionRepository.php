<?php

namespace App\Repository;

use App\Entity\Intervention;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Intervention>
 */
class InterventionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Intervention::class);
    }

    /**
     * Retourne les interventions d'un technicien, avec option de filtrage
     * 
     * @param int $technicienId
     * @param bool|null $reservedOnly Si true, retourne uniquement les interventions réservées
     *                                Si false ou null, retourne toutes les interventions
     * @return Intervention[]
     */
    public function findByTechnicienWithFilter(int $technicienId, ?bool $reservedOnly): array
    {
        $qb = $this->createQueryBuilder('i')
            ->where('i.technicien = :technicienId')
            ->setParameter('technicienId', $technicienId);

        if ($reservedOnly === true) {
            $qb->andWhere('i.client IS NOT NULL');
        }

        return $qb->getQuery()->getResult();
    }

//    /**
//     * @return Intervention[] Returns an array of Intervention objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('i')
//            ->andWhere('i.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('i.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Intervention
//    {
//        return $this->createQueryBuilder('i')
//            ->andWhere('i.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
