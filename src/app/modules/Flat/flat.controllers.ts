import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { FlatServices } from "./flat.services";
import sendUniqueResponse from "../../../shared/sendUniqeResponse";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import { flatFilterableFields, flatSearchableFields } from "./flat.constant";

const createFlat = catchAsync(async (req: Request, res: Response) => {
  const result = await FlatServices.createFlatIntoDB(req);
  sendUniqueResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Flat added successfully",
    data: result,
  });
});

const getAllFlats = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, flatFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await FlatServices.getAllFlatsIntoDB(filters, options);
  console.log(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Flats retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleFlat = catchAsync(async(req:Request, res: Response) =>{
  const { id } = req.params;
  const result = await FlatServices.getSingleFlatIntoDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single flat retrieval successfully',
    data: result,
  });
})

const updateFlat = catchAsync(async (req: Request, res: Response) => {
  const { flatId } = req.params;
  const result = await FlatServices.updateFlatIntoDB(flatId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Flat information updated successfully",
    data: result,
  });
});

export const FlatController = {
  createFlat,
  getAllFlats,
  getSingleFlat,
  updateFlat,
};
