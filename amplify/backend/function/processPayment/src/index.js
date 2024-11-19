const { CognitoIdentityServiceProvider } = require("aws-sdk");
const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
const USER_POOL_ID = "ap-southeast-2_ChsORWPSM";
const stripe = require("stripe")("sk_test_51O4n0jBWraf69XnWY4aVlVKRqQUCAFfd39aPqRYrDH1tVCUDkUv73npLZXUJcMEopBma6kK2JdyZEdh8aRCij6Lk00clrvlXD8");

const getUserEmail = async (event) => {
  if (!event.identity?.claims?.username) {
    throw new Error('User is not authenticated');
  }

  const params = {
    UserPoolId: USER_POOL_ID,
    Username: event.identity.claims.username
  };
  const user = await cognitoIdentityServiceProvider.adminGetUser(params).promise();
  const { Value: email } = user.UserAttributes.find((attr) => {
    if (attr.Name === "email") {
      return attr.Value;
    }
  });
  return email;
};

/*
 * Get the total price of the order
 * Charge the customer
 */
exports.handler = async (event) => {
  try {
    console.log('Full event:', JSON.stringify(event, null, 2));
    
    // Check different possible auth paths
    const username = event.identity?.claims?.username || 
                    event.identity?.username ||
                    event.requestContext?.authorizer?.claims?.username ||
                    event.requestContext?.identity?.cognitoAuthenticationProvider;
    
    if (!username) {
      console.log('Identity info:', JSON.stringify(event.identity, null, 2));
      console.log('RequestContext:', JSON.stringify(event.requestContext, null, 2));
      throw new Error('User is not authenticated');
    }

    const { id, cart, total, address, token } = event.arguments.input;
    const email = await getUserEmail(event);
    
    await stripe.charges.create({
      amount: total * 100,
      currency: "usd",
      source: token,
      description: `Order ${new Date()} by ${email}`
    });
    return { id, cart, total, address, username, email };
  } catch (err) {
    throw new Error(err);
  }
};
