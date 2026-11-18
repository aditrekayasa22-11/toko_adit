<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCashier
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, ['admin', 'kasir'], true)) {
            return response()->json(['message' => 'Akses hanya untuk kasir dan admin.'], 403);
        }

        return $next($request);
    }
}
