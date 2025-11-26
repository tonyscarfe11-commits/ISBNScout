  // Get trial status (works for both anonymous and authenticated)
  app.get("/api/trial/status", async (req, res) => {
    try {
      const { getUserIdentifier } = await import("./fingerprint");
      const { getTrialService } = await import("./trial-service");

      const { userId, fingerprint } = getUserIdentifier(req);
      const trialService = getTrialService(storage as any);

      // If authenticated, get subscription info
      if (userId) {
        const user = await authService.getUserById(userId);
        const isPaid = user && user.subscriptionTier && user.subscriptionTier !== 'trial';

        return res.json({
          isAuthenticated: true,
          isPaidSubscriber: isPaid,
          subscriptionTier: user?.subscriptionTier || 'trial',
          // Paid users don't have trial limits
          ...(!isPaid && {
            ...trialService.getTrialStatus(fingerprint)
          })
        });
      }

      // Anonymous user - return trial status
      const trialStatus = trialService.getTrialStatus(fingerprint);
      res.json({
        isAuthenticated: false,
        isPaidSubscriber: false,
        ...trialStatus,
      });
    } catch (error: any) {
      console.error("Get trial status error:", error);
      res.status(500).json({ message: error.message || "Failed to get trial status" });
    }
  });
