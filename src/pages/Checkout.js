import React from 'react'
import { Authenticator } from '@aws-amplify/ui-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from "../components/CheckoutForm";

const Checkout = () => {
    const stripePromise = loadStripe('pk_test_51O4n0jBWraf69XnWSeezJW88o1buIhc2GF99LFdvQAgYaaw1zpXEeAla8XHQZS08uNrkh0EusMbzHoKWKt0Vb7g500NTzmDcIq');

    return (
        <section className="checkout-wrapper">
            <Authenticator>
                {({ signOut, user }) => (
                    <main>
                        <h1>Hello {user.username}</h1>
                        <button onClick={signOut}>Sign out</button>
                        <Elements stripe={stripePromise}>
                            <section>
                                <h2>Time to Checkout?</h2>
                                <CheckoutForm user={user} />
                            </section>
                        </Elements>
                    </main>
                )}
            </Authenticator>
        </section>
    )
}

export default Checkout
