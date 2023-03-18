import express from "express";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Group from "../models/groupModel";
import { logger } from "../utils/logger";
import { GroupAttributes, ErrorType } from "../constants/constants";

const router = express.Router();

router.get(
  "/api/v1/groups",
  async (req: Request<{}, {}, {}>, res: Response<GroupAttributes[] | ErrorType>) => {
    try {
      const groups: GroupAttributes[] = await Group.findAll();

      if (!groups) {
        return res.status(404).send("Groups not found");
      }

      return res.status(200).json(groups);
    } catch (error) {
      logger.error(error.stack);
      logger.error(error.message);
      logger.error(error.errors[0].message);
      return res.status(500).json({ error: error.errors[0].message });
    }
  },
);

router.get(
  "/api/v1/groups/:id",
  async (req: Request<{ id: string }, {}, {}>, res: Response<GroupAttributes | ErrorType>) => {
    const groupId: string = req.params.id;
    try {
      const group: GroupAttributes = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).send("Group not found");
      }

      return res.status(200).json(group);
    } catch (error) {
      logger.error(error.stack);
      logger.error(error.message);
      logger.error(error.errors[0].message);
      return res.status(500).json({ error: error.errors[0].message });
    }
  },
);

router.post(
  "/api/v1/groups",
  async (
    req: Request<{ id: string }, {}, Omit<GroupAttributes, "id">>,
    res: Response<GroupAttributes | ErrorType>,
  ) => {
    const { name, description, data_created }: Omit<GroupAttributes, "id"> = req.body;

    try {
      const newGroup: GroupAttributes = await Group.create({
        id: uuidv4(),
        name,
        description,
        data_created,
      });

      return res.status(201).json(newGroup);
    } catch (error) {
      logger.error(error.stack);
      logger.error(error.message);
      logger.error(error.errors[0].message);
      return res.status(500).json({ error: error.errors[0].message });
    }
  },
);

router.put(
  "/api/v1/groups/:id",
  async (
    req: Request<{ id: string }, {}, Omit<GroupAttributes, "id" | "data_created">>,
    res: Response<GroupAttributes | ErrorType>,
  ) => {
    const groupId: string = req.params.id;
    const { name, description }: Omit<GroupAttributes, "id" | "data_created"> = req.body;

    try {
      const group = await Group.findOne({ where: { id: groupId } });
      if (!group) {
        return res.status(404).send("This group not exists in the system");
      }

      const updatedData: Omit<GroupAttributes, "id" | "data_created"> = {
        name,
        description,
      };

      const dataToUpdate = Object.keys(updatedData).filter(key => updatedData[key] !== undefined);

      dataToUpdate.forEach(key => (group[key] = updatedData[key]));

      await group.save();

      return res.status(200).json(group);
    } catch (error) {
      logger.error(error.stack);
      logger.error(error.message);
      logger.error(error.errors[0].message);
      return res.status(500).json({ error: error.errors[0].message });
    }
  },
);

router.delete(
  "/api/v1/groups/:id",
  async (req: Request<{ id: string }, {}, {}>, res: Response<string | ErrorType>) => {
    try {
      const groupId: string = req.params.id;

      const deletedGroup = await Group.destroy({ where: { id: groupId } });

      if (!deletedGroup) {
        return res.status(404).send("Group with this id not exists in the system");
      }

      return res.status(200).send("Group successfully deleted from the system!");
    } catch (error) {
      console.error(error);
      logger.error(error.stack);
      logger.error(error.message);
      logger.error(error.errors[0].message);
      return res.status(500).json({ error: error.errors[0].message });
    }
  },
);

export default router;
