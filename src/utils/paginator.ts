/** @format */

import { Model, ModelStatic, Op, QueryTypes } from "sequelize";
import { MemberCounts } from "../database/database";
import { PaginatorError, PaginatorErrorCodes } from "../types/interfaces";

export default class Paginator<ModelType extends Model> {
	private _pageIndex: number;
	public readonly pageSize: number;
	public readonly model: ModelStatic<ModelType>;
	private _whereQuery?: any;
	private _orderQuery?: [string, "ASC" | "DESC"][];
	private _maxPages!: number;
	public initialized = false;

	public get currentPage() {
		return this._pageIndex;
	}

	public get maxPages() {
		return this._maxPages;
	}

	public get whereQuery() {
		return this._whereQuery;
	}

	public set whereQuery(newWhereQuery: any) {
		this._whereQuery = newWhereQuery;
	}

	public async nextPage() {
		if (!this.initialized) {
			throw new PaginatorError(
				"Paginator not initialized.",
				PaginatorErrorCodes.NOT_INITIALIZED
			);
		}

		if (this._pageIndex + 1 >= this._maxPages) {
			throw new PaginatorError(
				"Already on last page.",
				PaginatorErrorCodes.MAX_PAGE
			);
		}
		this._pageIndex++;
		return await this._getPage();
	}

	public async previousPage() {
		if (!this.initialized) {
			throw new PaginatorError(
				"Paginator not initialized.",
				PaginatorErrorCodes.NOT_INITIALIZED
			);
		}

		if (this._pageIndex - 1 < 0) {
			throw new PaginatorError(
				"Already on first page.",
				PaginatorErrorCodes.MIN_PAGE
			);
		}
		this._pageIndex--;
		return await this._getPage();
	}

	public async goToPage(pageIndex: number) {
		if (!this.initialized) {
			throw new PaginatorError(
				"Paginator not initialized.",
				PaginatorErrorCodes.NOT_INITIALIZED
			);
		}

		if (pageIndex < 0 || pageIndex >= this._maxPages) {
			throw new PaginatorError(
				"Invalid page index.",
				PaginatorErrorCodes.INVALID_PAGE
			);
		}
		this._pageIndex = pageIndex;
		return await this._getPage();
	}

	public async firstPage() {
		if (!this.initialized) {
			throw new PaginatorError(
				"Paginator not initialized.",
				PaginatorErrorCodes.NOT_INITIALIZED
			);
		}

		this._pageIndex = 0;
		return await this._getPage();
	}

	public async lastPage() {
		if (!this.initialized) {
			throw new PaginatorError(
				"Paginator not initialized.",
				PaginatorErrorCodes.NOT_INITIALIZED
			);
		}

		this._pageIndex = this._maxPages - 1;
		return await this._getPage();
	}

	private async _getPage() {
		if (!this.initialized) {
			throw new PaginatorError(
				"Paginator not initialized.",
				PaginatorErrorCodes.NOT_INITIALIZED
			);
		}

		const result = await this.model.findAndCountAll({
			where: this._whereQuery,
			limit: this.pageSize,
			offset: this._pageIndex * this.pageSize,
			order: this._orderQuery,
		});
		this._maxPages = Math.ceil(result.count / this.pageSize);
		return result.rows;
	}

	public async init() {
		const result = await this.model.count({
			where: this._whereQuery,
		});
		this._maxPages = Math.ceil(result / this.pageSize);
		this.initialized = true;
		return this.firstPage();
	}

	constructor(paginatorOptions: {
		pageSize: number;
		model: ModelStatic<ModelType>;
		pageIndex?: number;
		whereQuery?: {};
		orderQuery?: [string, "ASC" | "DESC"][];
	}) {
		this._pageIndex = paginatorOptions.pageIndex ?? 0;
		this.pageSize = paginatorOptions.pageSize;
		this.model = paginatorOptions.model;
		this._whereQuery = paginatorOptions.whereQuery;
		this._orderQuery = paginatorOptions.orderQuery;
	}
}
