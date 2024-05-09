import { fromIni, fromEnv } from "@aws-sdk/credential-providers";
import type { AwsCredentialIdentityProvider } from "@smithy/types";
import { isAwsEnv } from "../utilities.js";

/**
 * 1. Profile names for Local development
 * - Linux/Mac: `~/.aws/credentials`
 * - Windows: `C:\Users\<username>\.aws\credentials`
 * 2. Set profile like follows (name must be default)
 * ```
 * [default]
 * aws_access_key_id=access_key
 * aws_secret_access_key=secret_access_key
 * region=us-east-1
 * ```
 */
const AWS_CREDENTIAL_PROFILE = "default" as const;
const validAwsCredentialsFromType = new Set(["PROFILE", "ENV"]);

type AWSCredentialsSource = "PROFILE" | "ENV";
type CredentialsSource = AWSCredentialsSource | undefined;

const fetchAwsCredentials = () => {
	if (isAwsEnv()) return;

	let fromType: CredentialsSource = process.env.AWS_CREDENTIALS_TYPE as CredentialsSource;
	if (!validAwsCredentialsFromType.has(fromType ?? "")) fromType = undefined;

	if (fromType === "ENV") {
		const credentials: AwsCredentialIdentityProvider = fromEnv();
		if (!credentials) throw new Error("fetchAwsCredentials: Cannot get credentials from env");
		return credentials;
	}
	// PROFILE
	const profile: string = process.env.AWS_CREDENTIALS_PROFILE ?? AWS_CREDENTIAL_PROFILE;
	const credentials: AwsCredentialIdentityProvider = fromIni({ profile });
	if (!credentials) {
		throw new Error(`fetchAwsCredentials: Cannot get credentials for profile:${profile}`);
	}
	return credentials;
};

export const credentials = fetchAwsCredentials();
