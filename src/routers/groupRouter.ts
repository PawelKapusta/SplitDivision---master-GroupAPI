import express from "express";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Group from "../models/groupModel";
import { logger } from "../utils/logger";
import {GroupAttributes, ErrorType, UpdateGroupRequest, GroupPostPayload, UserAttributes} from "../constants/constants";
import GroupsUsers from "../models/groupsUsersModel";
import { Op } from "sequelize";
import User from "../models/userModel";

const router = express.Router();

router.get("/api/v1/groups", async (req: Request, res: Response<GroupAttributes[] | ErrorType>) => {
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
});

router.get(
  "/api/v1/groups/:id",
  async (req: Request<{ id: string }>, res: Response<GroupAttributes | ErrorType>) => {
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

router.get("/api/v1/groups/:id/users", async (req: Request, res: Response<UserAttributes[] | ErrorType>) => {
    const groupId: string = req.params.id;

    try {
        const groupUsers: GroupsUsers[] = await GroupsUsers.findAll({
            where: {
                group_id: groupId
            }
        })

        const usersIds: string[] = groupUsers.map(user => user.dataValues.user_id);

        const users: UserAttributes[] = await User.findAll({
            where: {
                id: {
                    [Op.in]: usersIds
                }
            }
        });


        if (!users) {
            return res.status(404).send("Users not found");
        }

        return res.status(200).json(users);
    } catch (error) {
        logger.error(error.stack);
        logger.error(error.message);
        logger.error(error.errors[0].message);
        return res.status(500).json({ error: error.errors[0].message });
    }
});

router.get("/api/v1/groups/user/:id", async (req: Request, res: Response<GroupAttributes[] | ErrorType>) => {
    const userId: string = req.params.id;
    try {
        const groupsUsers: GroupsUsers[] = await GroupsUsers.findAll({
            where: {
                user_id: userId
            }
        })

        const groupIds: string[] = groupsUsers.map(group => group.dataValues.group_id);

        const groups: GroupAttributes[] = await Group.findAll({
            where: {
                id: {
                    [Op.in]: groupIds
                }
            }
        });

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
});

router.post(
  "/api/v1/groups",
  async (req: Request<Omit<GroupAttributes, "id">>, res: Response<GroupAttributes | ErrorType>) => {
    const { name, description, data_created, usersIdList }: Omit<GroupPostPayload, "id"> = req.body;

    try {
      const id = uuidv4();
      const newGroup:GroupAttributes = await Group.create({
        id,
        name,
        description,
        data_created,
      });

        for (const userId of usersIdList) {
            console.log("Here adding groups users");
            try {
                await GroupsUsers.create({
                    id: uuidv4(),
                    group_id: id,
                    user_id: userId
                })
                logger.info(`Successfully added user: ${userId} to group in database`);
            } catch (error) {
                logger.error(error.message);
                return res.status(500).json({ error: error.message });
            }
        }

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
  async (req: UpdateGroupRequest, res: Response<GroupAttributes | ErrorType>) => {
    const groupId: string = req.params.id;
    const { name, description }: Partial<GroupAttributes> = req.body;

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
  async (req: Request<{ id: string }>, res: Response<string | ErrorType>) => {
    try {
      const groupId: string = req.params.id;

      const deletedGroup = await Group.destroy({ where: { id: groupId } });

      if (!deletedGroup) {
        return res.status(404).send("Group with this id not exists in the system");
      }

      return res.status(200).send("Group successfully deleted from the system!");
    } catch (error) {
      logger.error(error.stack);
      logger.error(error.message);
      logger.error(error.errors[0].message);
      return res.status(500).json({ error: error.errors[0].message });
    }
  },
);

export default router;
