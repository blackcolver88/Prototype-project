package com.example.auth_service.Repository;

import com.example.auth_service.Entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(Long userId, Boolean read);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.read = false")
    long countUnreadNotifications(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :now WHERE n.userId = :userId")
    int markAllAsRead(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :now WHERE n.id = :notificationId AND n.userId = :userId")
    int markAsRead(@Param("notificationId") Long notificationId, @Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    void deleteByUserId(Long userId);

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    int countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    int deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :fromDate ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("userId") Long userId, @Param("fromDate") LocalDateTime fromDate);
}
