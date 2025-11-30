declare module 'amazon-paapi' {
  interface CommonParameters {
    AccessKey: string;
    SecretKey: string;
    PartnerTag: string;
    PartnerType?: string;
    Marketplace?: string;
  }

  interface RequestParameters {
    Keywords?: string;
    SearchIndex?: string;
    ItemCount?: number;
    ItemIds?: string[];
    ItemIdType?: string;
    Condition?: string;
    Resources?: string[];
  }

  interface PriceInfo {
    Amount?: number;
    Currency?: string;
    DisplayAmount?: string;
  }

  interface OfferListing {
    Price?: PriceInfo;
    Condition?: { Value?: string };
    Availability?: { Message?: string };
    SavingBasis?: PriceInfo;
  }

  interface OfferSummary {
    LowestPrice?: PriceInfo;
    Condition?: { Value?: string };
  }

  interface BrowseNode {
    SalesRank?: number;
    Id?: string;
    DisplayName?: string;
  }

  interface SearchItem {
    ASIN?: string;
    DetailPageURL?: string;
    ItemInfo?: {
      Title?: { DisplayValue?: string };
      ExternalIds?: {
        ISBNs?: { DisplayValues?: string[] };
        EANs?: { DisplayValues?: string[] };
      };
    };
    Offers?: {
      Listings?: OfferListing[];
      Summaries?: OfferSummary[];
    };
    Images?: {
      Primary?: {
        Medium?: { URL?: string };
        Large?: { URL?: string };
      };
    };
    BrowseNodeInfo?: {
      BrowseNodes?: BrowseNode[];
    };
  }

  interface SearchResult {
    Items?: SearchItem[];
    TotalResultCount?: number;
  }

  interface SearchItemsResponse {
    SearchResult?: SearchResult;
    Errors?: Array<{ Code?: string; Message?: string }>;
  }

  interface GetItemsResponse {
    ItemsResult?: {
      Items?: SearchItem[];
    };
    Errors?: Array<{ Code?: string; Message?: string }>;
  }

  function SearchItems(
    commonParameters: CommonParameters,
    requestParameters: RequestParameters
  ): Promise<SearchItemsResponse>;

  function GetItems(
    commonParameters: CommonParameters,
    requestParameters: RequestParameters
  ): Promise<GetItemsResponse>;

  function GetVariations(
    commonParameters: CommonParameters,
    requestParameters: RequestParameters
  ): Promise<any>;

  function GetBrowseNodes(
    commonParameters: CommonParameters,
    requestParameters: RequestParameters
  ): Promise<any>;

  export default {
    SearchItems,
    GetItems,
    GetVariations,
    GetBrowseNodes,
  };
}
