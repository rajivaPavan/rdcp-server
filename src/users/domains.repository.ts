import { Injectable } from "@nestjs/common";
import { WhitelistedDomain } from "./entities/whitelisted-domain.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class DomainsRepository {
  constructor(
    @InjectModel('WhitelistedDomain') private domainModel: Model<WhitelistedDomain>
  ) { }

    async create(domain: WhitelistedDomain): Promise<WhitelistedDomain> {
        const createdDomain = new this.domainModel(domain);
        return await createdDomain.save();
    }

    async search(query: { domain?: string }, limit = 20, page = 1): Promise<{
        domains: Partial<WhitelistedDomain>[],
        total: number
    }> {
        // prepare query
        let preparedQuery = {};
        if (query.domain) {
            preparedQuery = {
                ...preparedQuery,
                domain: { $regex: query.domain, $options: 'i' }
            };
        }

        const domains = await this.domainModel.find(preparedQuery, {
            "createdAt": 0,
            "updatedAt": 0,
            "__v": 0
        }).limit(limit).skip(limit * (page - 1)).exec();

        return {
            domains,
            total: await this.domainModel.countDocuments().exec(),
        };
    }

    // delete domain
    async deleteDomain(domainId: string) {
        return this.domainModel.findByIdAndDelete(domainId).exec();
    }

    async findDomain(domain: string): Promise<WhitelistedDomain> {
        return this.domainModel.findOne({ domain }).exec();
    }
}