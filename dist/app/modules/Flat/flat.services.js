"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const flat_constant_1 = require("./flat.constant");
const fileUploadHelper_1 = require("../../../helpers/fileUploadHelper");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const flat_utils_1 = require("./flat.utils");
const createFlatIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req === null || req === void 0 ? void 0 : req.user;
    const file = req.file;
    const existingFlat = yield prisma_1.default.flat.findUnique({
        where: {
            flatName: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.flatName,
        },
    });
    if (existingFlat) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "This flat you alrady created!");
    }
    if ((user === null || user === void 0 ? void 0 : user.role) === "SELLER") {
        if (file) {
            const uploadedProfileImage = yield fileUploadHelper_1.FileUploadHelper.uploadToCloudinary(file);
            req.body.flatPhoto = uploadedProfileImage === null || uploadedProfileImage === void 0 ? void 0 : uploadedProfileImage.secure_url;
        }
        const flatNo = yield (0, flat_utils_1.generateFlatNumber)();
        const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
            const createFlat = yield transactionClient.flat.create({
                data: {
                    flatNo: flatNo,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    flatName: req.body.flatName,
                    squareFeet: req.body.squareFeet,
                    totalBedrooms: req.body.totalBedrooms,
                    totalRooms: req.body.totalRooms,
                    utilitiesDescription: req.body.utilitiesDescription,
                    location: req.body.location,
                    description: req.body.description,
                    amenities: req.body.amenities,
                    rent: req.body.rent,
                    advanceAmount: req.body.advanceAmount,
                    flatPhoto: req.body.flatPhoto,
                },
            });
            return createFlat;
        }));
        return result;
    }
    else {
        console.log("You are not parmited!");
    }
});
const getAllFlatsIntoDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    //// search Term
    if (searchTerm) {
        andConditions.push({
            OR: flat_constant_1.flatSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: filterData[key],
                    },
                };
            }),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.flat.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: "desc",
            },
        include: {
            user: true,
            booking: true,
        },
    });
    const total = yield prisma_1.default.flat.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const getSellerFlatsIntoDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.flat.findMany({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
            isDeleted: false,
        },
        include: {
            booking: true,
        },
    });
    return result;
});
const getSingleFlatIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.flat.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            user: true,
            /* booking: true, */
        },
    });
    return result;
});
const updateFlatIntoDB = (flatId, req) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    yield prisma_1.default.flat.findUniqueOrThrow({
        where: {
            id: flatId,
            isDeleted: false,
        },
    });
    const file = req.file;
    if (file) {
        const uploadedProfileImage = yield fileUploadHelper_1.FileUploadHelper.uploadToCloudinary(file);
        req.body.flatPhoto = uploadedProfileImage === null || uploadedProfileImage === void 0 ? void 0 : uploadedProfileImage.secure_url;
    }
    const result = yield prisma_1.default.flat.update({
        where: {
            id: flatId,
        },
        data: req.body,
    });
    return result;
});
const softDeleteFlatIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.flat.update({
        where: {
            id,
            isDeleted: false,
        },
        data: {
            isDeleted: true,
        },
    });
    return result;
});
const deleteFlatIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.flat.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.FlatServices = {
    createFlatIntoDB,
    getAllFlatsIntoDB,
    getSellerFlatsIntoDB,
    getSingleFlatIntoDB,
    updateFlatIntoDB,
    softDeleteFlatIntoDB,
    deleteFlatIntoDB,
};
