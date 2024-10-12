import { Injectable } from "@nestjs/common";
import { DomainsRepository } from "./domains.repository";
import { WhitelistedDomain } from "./entities/whitelisted-domain.schema";

@Injectable()
export class DomainsAdminService {
    constructor(
        private readonly domainsRepository: DomainsRepository,
    ) {}

    async getDomains() {
        return await this.domainsRepository.find({});
    }

    async addDomain(domain: string) {
        await this.domainsRepository.create(new WhitelistedDomain({ domain }));
    }

    async deleteDomain(domainId: string) {
        await this.domainsRepository.deleteDomain(domainId);
    }
} 