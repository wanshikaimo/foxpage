import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, StoreOrder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddGoodsToApplicationReq, GetPageTemplateListRes } from '../../types/validates/store-validate-types';
import * as Response from '../../utils/response';
import { formatToPath, generationId, randStr } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('stores')
export class AddStorePageToApplication extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add the store page and template products to the specified application
   *
   * 1, Get the project information corresponding to the page
   * 2, Get the details of the page, including dependency information (except for components)
   * 3, Create a project in the specified application, create a new page information, and rely on the information.
   * 4, record product information in the order table
   * @param  {GetPageTemplateListReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Post('/pages')
  @OpenAPI({
    summary: i18n.sw.addStorePagesToApplications,
    description: '',
    tags: ['Store'],
    operationId: 'add-store-pages-to-applications',
  })
  @ResponseSchema(GetPageTemplateListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddGoodsToApplicationReq): Promise<ResData<StoreOrder[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.RESOURCE });

      // Check permission
      // const hasAuth = await Promise.all(params.appIds.map((appId) => this.service.auth.application(appId)));
      // if (hasAuth.indexOf(false) !== -1) {
      //   return Response.accessDeny(i18n.system.accessDeny);
      // }

      // Check the status of the goods
      const goodsList = await this.service.store.goods.getDetailByIds(params.goodsIds);

      if (goodsList.length === 0) {
        return Response.warning(i18n.store.invalidGoodsIds, 2130301);
      }

      const invalidGoods = _.filter(goodsList, (goods) => {
        return goods.status === 0 || goods.deleted;
      });

      if (invalidGoods.length > 0) {
        return Response.warning(i18n.store.invalidGoods + _.map(invalidGoods, 'name').join(','), 2130302);
      }

      // TODO Check app permissions

      // Get the file details corresponding to the goods
      const goodsFileIds = _.map(_.map(goodsList, 'details'), 'id');
      const goodsFileObject = _.keyBy(goodsList, 'details.id');
      const goodsFileList = await this.service.file.list.getDetailByIds(goodsFileIds);
      const goodsProjectList = await this.service.folder.list.getDetailByIds(
        _.uniq(_.map(goodsFileList, 'folderId')),
      );
      const folderObject = _.keyBy(goodsProjectList, 'id');

      // Add the file corresponding to the goods to the application
      let projectIdMap = new Map<string, string>();
      let goodsOrders: StoreOrder[] = [];
      for (const file of goodsFileList) {
        for (const appId of params.appIds) {
          if (!projectIdMap.has(file.folderId)) {
            const sourceFolderDetail = folderObject[file.folderId] || {};
            const projectId = generationId(PRE.FOLDER);
            const folderName = [sourceFolderDetail.name, randStr(4)].join('_');
            projectIdMap.set(file.folderId, projectId);

            // Create project folder
            await this.service.folder.info.addTypeFolderDetail(
              {
                id: projectId,
                name: folderName,
                intro: sourceFolderDetail.intro || '',
                applicationId: appId,
                folderPath: formatToPath(folderName),
                tags: (sourceFolderDetail?.tags || [])?.concat({ copyFrom: file.folderId }),
              },
              { ctx, type: TYPE.PROJECT as AppFolderTypes },
            );
          }

          // Create file, content, version
          await this.service.file.info.copyFile(file.id, appId, {
            ctx,
            folderId: <string>projectIdMap.get(file.folderId),
            hasLive: true,
            setLive: true,
          });

          // Add goods order
          goodsOrders.push({
            id: generationId(PRE.ORDER),
            goodsId: goodsFileObject?.[file.id]?.id || '',
            goodsVersionId: '',
            customer: {
              id: file.id,
              applicationId: appId,
              projectId: projectIdMap.get(file.folderId) || '',
              userId: ctx.userInfo.id,
            },
            delivery: TAG.DELIVERY_CLONE,
          });
        }
      }

      if (goodsOrders.length > 0) {
        this.service.store.order.addDetailQuery(goodsOrders);
      }

      await this.service.store.goods.runTransaction(ctx.transactions);

      return Response.success(i18n.store.addGoodsToAppSuccess, 1130301);
    } catch (err) {
      return Response.error(err, i18n.store.addStorePageToApplicationFailed, 3130301);
    }
  }
}
