import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ChatMessage {
    media?: ExternalBlob;
    content: string;
    sender: Principal;
    timestamp: bigint;
}
export interface UserProfile {
    status: string;
    username: string;
    profilePicture?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGallery(): Promise<Array<ExternalBlob>>;
    getMessages(): Promise<Array<ChatMessage>>;
    getProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(username: string, password: string): Promise<UserProfile>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(content: string, media: ExternalBlob | null): Promise<void>;
    updateProfile(profilePicture: ExternalBlob | null, status: string): Promise<void>;
}
