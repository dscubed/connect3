import { authenticateRequest } from "@/lib/api/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const user = authResult.user;
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { key, value } = body;

  if (!key || !value) {
    return NextResponse.json(
      { success: false, error: "Key and value are required in the request body" },
      { status: 400 }
    );
  }

  const client = new SecretManagerServiceClient({ 
    credentials: { 
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, 
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL
    },
  });

  const parent = 'projects/connect3-demo'; // Project for which to manage secrets.
  try {
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: key,
      secret: {
        name: key,
        replication: {
          automatic: {},
        },
      },
    });

    console.info(`Created secret ${secret.name}`);
    // Add a version with a payload onto the secret.
    const [version] = await client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: new TextEncoder().encode(value),
      },
    });

    console.info(`Created version ${version.name}`);

    return NextResponse.json(
      { success: true, versionName: version.name },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to write secret. Reason: ", error);
    return NextResponse.json(
      { success: false, error: "Failed to create secret" },
      { status: 500 }
    );
  }
}
