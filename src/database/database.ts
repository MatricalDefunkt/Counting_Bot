/** @format */

import { Sequelize, DataTypes, Model } from "sequelize";

const sequelize = new Sequelize("database", "user", "pass", {
	host: "localhost",
	dialect: "sqlite",
	logging: false,
	typeValidation: true,
	storage: "CountingBot.sqlite",
});

export class Configs extends Model<{
	guildId: string;
	countingChannelId?: string;
	staffRoleId?: string;
	deleteIfWrong?: boolean;
	resetIfWrong?: boolean;
}> {
	public get guildId() {
		return this.getDataValue("guildId");
	}
	public get countingChannelId() {
		return this.getDataValue("countingChannelId");
	}
	public set countingChannelId(newId) {
		this.setDataValue("countingChannelId", newId);
		this._onUpdate(this);
	}
	public get staffRoleId() {
		return this.getDataValue("staffRoleId");
	}
	public set staffRoleId(newId) {
		this.setDataValue("staffRoleId", newId);
		this._onUpdate(this);
	}
	public get deleteIfWrong() {
		return this.getDataValue("deleteIfWrong");
	}
	public set deleteIfWrong(newBoolean) {
		this.setDataValue("deleteIfWrong", newBoolean);
		this._onUpdate(this);
	}
	public get resetIfWrong() {
		return this.getDataValue("resetIfWrong");
	}
	public set resetIfWrong(newBoolean) {
		this.setDataValue("resetIfWrong", newBoolean);
		this._onUpdate(this);
	}
	private async _onUpdate(newState: Configs) {
		ServerConfigs.delete(newState.guildId);
		ServerConfigs.set(newState.guildId, newState);
		await newState.save();
	}
}

Configs.init(
	{
		guildId: { type: DataTypes.TEXT(), primaryKey: true },
		countingChannelId: DataTypes.TEXT(),
		staffRoleId: DataTypes.TEXT(),
		deleteIfWrong: DataTypes.BOOLEAN(),
	},
	{ sequelize, tableName: "Configurations" }
);

export class Counts extends Model<{
	guildId: string;
	count: number;
	highestCount: number;
	lastMessageId: string;
	lastCounterId: string;
}> {
	public get guildId() {
		return this.getDataValue("guildId");
	}
	public get count() {
		return this.getDataValue("count");
	}
	public set count(newCount) {
		this.setDataValue("count", newCount);
		this._onUpdate(this);
	}
	public get highestCount() {
		return this.getDataValue("count");
	}
	public set highestCount(newHighestCount) {
		this.setDataValue("highestCount", newHighestCount);
		this._onUpdate(this);
	}
	public get lastMessageId() {
		return this.getDataValue("lastMessageId");
	}
	public set lastMessageId(newLastMessageId) {
		this.setDataValue("lastMessageId", newLastMessageId);
		this._onUpdate(this);
	}
	public get lastCounterId() {
		return this.getDataValue("lastCounterId");
	}
	public set lastCounterId(newLastCounterId) {
		this.setDataValue("lastCounterId", newLastCounterId);
		this._onUpdate(this);
	}
	private async _onUpdate(newState: Counts) {
		ServerCounts.delete(newState.guildId);
		ServerCounts.set(newState.guildId, newState);
		await newState.save();
	}
}

Counts.init(
	{
		guildId: { type: DataTypes.TEXT(), primaryKey: true },
		count: DataTypes.NUMBER(),
		highestCount: DataTypes.NUMBER(),
		lastMessageId: DataTypes.STRING(),
		lastCounterId: DataTypes.STRING(),
	},
	{ sequelize }
);

export class MemberCounts extends Model<{
	userId: string;
	guildId: string;
	counts: number;
	lastCount: number;
}> {
	public get userId() {
		return this.getDataValue("userId");
	}
	public get guildId() {
		return this.getDataValue("guildId");
	}
	public get counts() {
		return this.getDataValue("counts");
	}
	public set counts(newCount) {
		this.setDataValue("counts", newCount);
	}
	public get lastCount() {
		return this.getDataValue("counts");
	}
	public set lastCount(newlastCount) {
		this.setDataValue("lastCount", newlastCount);
	}
	public get lastCountTime() {
		//@ts-ignore
		return this.getDataValue("updatedAt") as Date;
	}
}

MemberCounts.init(
	{
		userId: { type: DataTypes.TEXT(), primaryKey: true },
		guildId: { type: DataTypes.TEXT(), primaryKey: true },
		counts: { type: DataTypes.NUMBER() },
		lastCount: { type: DataTypes.NUMBER() },
	},
	{ sequelize }
);

(async () => {
	await Configs.sync();
	await Counts.sync();
	await MemberCounts.sync();
})();
