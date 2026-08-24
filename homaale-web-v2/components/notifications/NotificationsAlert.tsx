'use client'

import { axiosClient } from '@/utils/axiosClient'
import React, { useEffect, useRef } from 'react'
import { showNotification } from '@mantine/notifications'
import { useMantineTheme } from '@mantine/styles'
import { createStyles } from '@mantine/core'

export const NotificationsAlert = () => {
  const notificationDataRef = useRef<any[]>([])
  const lastNotificationIdRef = useRef<number | null>(null)
  const isFetching = useRef(false) // Prevent concurrent fetches
  const useStyles = createStyles((theme) => ({
    '@keyframes fallFromTop': {
      '0%': {
        transform: 'translateY(-100%)',
        opacity: 0,
      },
      '100%': {
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
  
    root: {
      position:"fixed",
      top:"80px",
      right:"40%",
      animation: 'fallFromTop 0.6s ease-out ',
      fontSize: theme.fontSizes.md,
      color: theme.black, 
      backgroundColor: theme.white,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      boxShadow: theme.shadows.md,
      textAlign: 'center',
    },
  }))
  
  
  const { classes } = useStyles()

  // Initialize lastNotificationId from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLastId = localStorage.getItem('lastNotificationId')
      if (storedLastId) {
        lastNotificationIdRef.current = parseInt(storedLastId, 10)
      }
    }
  }, [])


  // Debounce function to limit fetch calls
  const debounce = (func: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(func, delay)
    }
  }

  const fetchNotifications = async () => {
    if (isFetching.current) return // Prevent concurrent fetches
    isFetching.current = true

    try {
      const response = await axiosClient.get('/notification/')
      const newNotifications = response.data.result

      if (newNotifications.length > 0) {
        // Find the latest notification by highest ID
        const latestNotification = newNotifications.reduce((latest: any, current: any) =>
          current.id > latest.id ? current : latest
        )

        // Only show toast if the latest notification is newer than the stored ID
        if (lastNotificationIdRef.current === null || latestNotification.id > lastNotificationIdRef.current) {
          // Play notification sound
          try {
            const audio = new Audio('/NotificationSound/1.mp3')
            await audio.play()
          } catch (error) {
            console.warn('Audio playback failed:', error)
          }


          // Show Mantine notification based on notification type
          switch (latestNotification.title.toLowerCase()) {
            case 'reward_earned':
              showNotification({
                id: `notification-${latestNotification.id}`, // Unique ID to prevent duplicates
                title: 'Reward Earned! 🎉',
                message: `${latestNotification.content_object.points} Points Earned! ${latestNotification.content_object.object_repr}`,
                color: 'green',
                autoClose: 5000,
                classNames: { root: classes.root },
              })
              break
            case 'kyc_document_verified':
              showNotification({
                id: `notification-${latestNotification.id}`,
                title: 'KYC Verified! ✅',
                message: 'Your KYC document has been verified successfully!',
                color: 'green',
                autoClose: 5000,
                classNames: { root: classes.root },
              })
              break
            case 'kyc_document_submitted':
              showNotification({
                id: `notification-${latestNotification.id}`,
                title: 'KYC Submitted 📝',
                message: 'Your KYC document has been submitted for verification.',
                color: 'blue',
                autoClose: 5000,
                classNames: { root: classes.root },
              })
              break
            case 'approval':
              showNotification({
                id: `notification-${latestNotification.id}`,
                title: 'Request Approved! 👍',
                message: `${latestNotification.content_object.entity_service.title} has been ${latestNotification.content_object.status}`,
                color: 'green',
                autoClose: 5000,
                classNames: { root: classes.root },
              })
              break
            default:
              showNotification({
                id: `notification-${latestNotification.id}`,
                title: 'New Notification 🔔',
                message: 'You have a new notification!',
                color: 'blue',
                autoClose: 5000,
                classNames: { root: classes.root },
              })
          }

          // Replace old ID with new ID in localStorage
          lastNotificationIdRef.current = latestNotification.id
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastNotificationId', latestNotification.id.toString())
          }
        }

        notificationDataRef.current = newNotifications
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // showNotification({
      //   id: 'error-notification',
      //   title: 'Error',
      //   message: 'Failed to fetch notifications',
      //   color: 'red',
      //   autoClose: 5000,
      //   styles: {
      //     root: {
      //       position: 'fixed',
      //       top: '20px',
      //       right: '20px',
      //     },
      //   },
      // })
    } finally {
      isFetching.current = false // Reset fetch lock
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // Debounced fetch when page becomes visible
    const debouncedFetch = debounce(fetchNotifications, 1000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedFetch()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null // No UI rendering needed as we use notifications
}
