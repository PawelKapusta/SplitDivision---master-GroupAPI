import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database/config";
import { GroupsUsersAttributes } from "../constants/constants";

class GroupsUsers
    extends Model<GroupsUsersAttributes, Optional<GroupsUsersAttributes, "id">>
    implements GroupsUsersAttributes
{
    public id!: string;
    public group_id!: string;
    public user_id!: string;
}

GroupsUsers.init(
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },
        group_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: "groups_users",
        timestamps: false,
    },
);

export default GroupsUsers;
