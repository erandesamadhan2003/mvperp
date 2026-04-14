export interface OrganizationInfo {
    OCode: number;
    OrganizationName: string;
    OrganizationInNativeLanguage: string;
    SansthaName: string;
    Address: string;
    Taluka: string;
    District: string;
    States: string;
    PinCode: string;
    Establish: string;
    RegistrationNumber: string;
    RegistrationDate: string;
    Logo: string;
    OrganizationLogo: string;
    OrganizationNameForReport: string;
    ContentType: string;
    UploadedFileName: string;
    AddBy: string;
    AddByTime: string;
    EditBy: string | null;
    EditByTime: string | null;
    URID: string;
}

export interface NewsAndAnnouncement {
    ID: number;
    SRNO: number;
    MessageHeader: string;
    Details: string;
    RefURL: string | null;
    AttachmentFile: string | null;
    IsActive: boolean;
    AddBy: number;
    AddByTime: string;
    EditBy: number | null;
    EditByTime: string | null;
}

export interface ApiListResponse<T> {
    ResponseCode: number;
    Message: string | null;
    ResponseData: T[];
}
