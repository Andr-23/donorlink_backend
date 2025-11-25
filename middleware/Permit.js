const permit = (allowedRoles) => {
  return (req, res, next) => {
    const { user } = req;
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const hasPermission = user.roles.some((role) =>
      allowedRoles.includes(role)
    );
    if (!hasPermission) {
      return res.status(403).send({ error: 'Forbidden' });
    }
    next();
  };
};

export default permit;
