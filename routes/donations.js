import express from 'express';
import auth from '../middleware/Auth.js';
import permit from '../middleware/Permit.js';
import Donation from '../models/Donation.js';
import checkNotBanned from '../middleware/CheckNotBanned.js';

const donationsRouter = express.Router();

donationsRouter.post('/', auth, checkNotBanned, async (req, res, next) => {
  try {
    const { status, scheduledFor, centerId, notes } = req.body;

    const donation = new Donation({
      userId: req.user._id,
      status: status || 'requested',
      scheduledFor,
      centerId,
      notes,
    });

    await donation.save();
    res.status(201).send(donation);
  } catch (error) {
    next(error);
  }
});

donationsRouter.get(
  '/my-donations',
  auth,
  checkNotBanned,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const donations = await Donation.find({ userId: req.user._id })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await Donation.countDocuments({ userId: req.user._id });
      const totalPages = Math.ceil(total / limit);

      res.status(200).send({
        donations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

donationsRouter.get('/:id', auth, async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('userId', 'fullname')
      .populate('centerId', 'name address');

    if (!donation) {
      res.status(404).send({ error: 'Donation not found' });
      return;
    }

    if (
      req.user.roles.includes('admin') ||
      donation.userId._id.toString() === req.user._id.toString()
    ) {
      res.status(200).send(donation);
    } else {
      res
        .status(403)
        .send({ error: 'You do not have permission to view this donation' });
    }
  } catch (error) {
    next(error);
  }
});

donationsRouter.get('/', auth, permit(['admin']), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const donations = await Donation.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Donation.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

donationsRouter.put('/:id', auth, permit(['admin']), async (req, res, next) => {
  try {
    const { status, completedAt } = req.body;
    const updateData = {};

    if (status !== undefined) {
      if (
        !['requested', 'confirmed', 'completed', 'canceled'].includes(status)
      ) {
        res.status(400).send({
          error:
            'Invalid status. Must be one of: requested, confirmed, completed, canceled',
        });
        return;
      }
      updateData.status = status;
    }

    if (completedAt !== undefined) {
      updateData.completedAt = completedAt;
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!donation) {
      res.status(404).send({ error: 'Donation not found' });
      return;
    }

    res.status(200).send(donation);
  } catch (error) {
    next(error);
  }
});

export default donationsRouter;
