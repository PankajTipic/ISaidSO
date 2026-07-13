<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

use SocialiteProviders\Manager\SocialiteWasCalled;
use SocialiteProviders\Apple\AppleExtendSocialite;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    

    /**
     * Bootstrap any application services.
     */
    // public function boot(): void
    // {
    //     Schema::defaultStringLength(191);
    // }

        public function boot(): void
{
    Schema::defaultStringLength(191);

    \Illuminate\Support\Facades\Event::listen(
        \SocialiteProviders\Manager\SocialiteWasCalled::class,
        \SocialiteProviders\Facebook\FacebookExtendSocialite::class,
    );

   \Illuminate\Support\Facades\Event::listen(
    \SocialiteProviders\Manager\SocialiteWasCalled::class,
    \SocialiteProviders\Microsoft\MicrosoftExtendSocialite::class,
);

    \Illuminate\Support\Facades\Event::listen(
        \SocialiteProviders\Manager\SocialiteWasCalled::class,
        \SocialiteProviders\Apple\AppleExtendSocialite::class,
    );
}
}
